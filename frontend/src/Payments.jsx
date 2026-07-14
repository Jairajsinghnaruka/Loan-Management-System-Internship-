import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './Payments.css';

function Payments({ dataLoans = [], onPaymentSuccess }) {
  const [searchId, setSearchId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [grossAmountReceived, setGrossAmountReceived] = useState('');
  const [penaltyCharge, setPenaltyCharge] = useState('');
  const [delayInterestRate, setDelayInterestRate] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNum, setReferenceNum] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [loanSchedule, setLoanSchedule] = useState([]);
  const [historicalPayments, setHistoricalPayments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState({ text: "", type: "" });
  const [hoveredEmiId, setHoveredEmiId] = useState(null);

  const activeLoanProfile = useMemo(() => {
    if (!selectedLoanId) return null;
    return dataLoans.find(l => String(l.id) === String(selectedLoanId));
  }, [selectedLoanId, dataLoans]);

  const totalLoanCollection = useMemo(() => {
    return historicalPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [historicalPayments]);

  const ledgerBreakdown = useMemo(() => {
    const totalCash = parseFloat(grossAmountReceived) || 0;
    const penalty = parseFloat(penaltyCharge) || 0;
    return { netPrincipalPreview: Math.max(0, totalCash - penalty), isValid: totalCash >= penalty };
  }, [grossAmountReceived, penaltyCharge]);

  const fetchLoanData = async (loanId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [schedRes, histRes] = await Promise.all([
        axios.get(`http://localhost:4000/api/payments/schedule?loan_id=${loanId}`, { headers }),
        axios.get(`http://localhost:4000/api/payments?loan_id=${loanId}`, { headers })
      ]);
      if (schedRes.data.success) setLoanSchedule(schedRes.data.schedule || []);
      if (histRes.data.success) setHistoricalPayments(histRes.data.payments || []);
    } catch (err) {
      triggerBanner("Failed to synchronize customer schedule records.", "error");
    }
  };

  useEffect(() => {
    if (selectedLoanId) fetchLoanData(selectedLoanId);
  }, [selectedLoanId]);

  const handleSearchLookup = (e) => {
    e.preventDefault();
    const match = dataLoans.find(l => String(l.id) === searchId.trim());
    if (match) {
      setSelectedLoanId(match.id);
      triggerBanner(`Portfolio loaded for File ID #${match.id}`, "success");
    } else {
      triggerBanner("Account record reference not found.", "error");
      setSelectedLoanId('');
    }
  };

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!activeLoanProfile || !ledgerBreakdown.isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        loan_id: Number(activeLoanProfile.id),
        amount: parseFloat(grossAmountReceived),
        penalty_paid: parseFloat(penaltyCharge) || 0,
        delay_interest_rate: parseFloat(delayInterestRate) || 0,
        payment_mode: paymentMode,
        transaction_reference: referenceNum.trim() || `COUNTER-${Date.now()}`,
        payment_date: new Date(paymentDate).toISOString()
      };

      const response = await axios.post('http://localhost:4000/api/payments/manual-adjust', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        triggerBanner("✓ Transaction posted and auto-calculated successfully.", "success");
        setGrossAmountReceived('');
        setPenaltyCharge('');
        setDelayInterestRate('');
        setReferenceNum('');
        setTimeout(() => {
          fetchLoanData(activeLoanProfile.id);
          if (onPaymentSuccess) onPaymentSuccess();
        }, 300);
      }
    } catch (error) {
      triggerBanner(error.response?.data?.message || "Transaction reconciliation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerBanner = (text, type) => {
    setBanner({ text, type });
    setTimeout(() => setBanner({ text: "", type: "" }), 4000);
  };

  // We map over schedule and cleanly slice/assign historical payments proportionally or sequentially 
  // so each EMI entry gets exclusively the payment slice that funded it.
  const cleanScheduleWithAllocatedPayments = useMemo(() => {
    let paymentRemaining = parseFloat(grossAmountReceived) || 0;
    let balance = activeLoanProfile ? Number(activeLoanProfile.principal_amount || activeLoanProfile.loan_amount || 0) : 0;
    const rate = activeLoanProfile && activeLoanProfile.interest_rate ? Number(activeLoanProfile.interest_rate) : 18;
    const monthlyRate = rate / 12 / 100;
    const totalTenure = loanSchedule.length || 1;

    let cumulativeRecovered = 0;
    let paymentCursor = 0; // tracks how much of historicalPayments has been consumed by previous EMIs

    return loanSchedule.map((sch, index) => {
      const calculatedInterest = balance * monthlyRate;
      const remainingTenure = totalTenure - index;
      const calculatedEmi = (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingTenure)) / (Math.pow(1 + monthlyRate, remainingTenure) - 1) || sch.amount;
      const principalComp = Math.max(0, calculatedEmi - calculatedInterest);
      
      const allocatedPrincipal = Math.min(balance, principalComp);
      balance = Math.max(0, balance - allocatedPrincipal);

      const penaltyComp = Number(sch.penalty_component || 0);
      const dynamicEmiTotal = allocatedPrincipal + calculatedInterest;
      const totalExpected = dynamicEmiTotal + penaltyComp;
      const totalPaid = Number(sch.principal_paid || 0) + Number(sch.interest_paid || 0) + Number(sch.penalty_paid || 0);
      
      cumulativeRecovered += totalPaid;
      const currentCyclePaid = totalPaid; // Total paid specific to this cycle from backend/state

      const remaining = Math.max(0, totalExpected - totalPaid);
      const amountToApply = Math.min(paymentRemaining, remaining);
      paymentRemaining -= amountToApply;

      const finalRemaining = Math.max(0, remaining - amountToApply);
      const isPastDue = new Date(sch.due_date) < new Date();
      let status = sch.status;

      if (finalRemaining <= 0.01) status = "PAID";
      else if (isPastDue && finalRemaining > 0) status = "OVERDUE";
      else if (amountToApply > 0 || totalPaid > 0) status = "PARTIAL";
      else status = isPastDue ? "OVERDUE" : "PENDING";

      // Slice historicalPayments sequentially based on paid values per installment
      let cycleAssignedPayments = [];
      let accumulatedCycleLimit = currentCyclePaid;
      
      while (paymentCursor < historicalPayments.length && accumulatedCycleLimit > 0) {
        const p = historicalPayments[paymentCursor];
        const pAmt = Number(p.amount || 0);
        
        cycleAssignedPayments.push(p);
        accumulatedCycleLimit -= pAmt;

        if (accumulatedCycleLimit <= 0) {
          // If a payment covers multiple parts or we move to the next
          break;
        } else {
          paymentCursor++;
        }
      }

      return {
        ...sch,
        computedStatus: status,
        displayPenaltyComp: penaltyComp,
        displayInterestComp: calculatedInterest,
        displayPrincipalComp: allocatedPrincipal,
        displayRemaining: finalRemaining,
        endingPrincipalBalance: balance,
        dynamicTotalEmi: dynamicEmiTotal,
        cumulativeRecoveredTillHere: cumulativeRecovered,
        currentCycleRecovered: currentCyclePaid,
        assignedPayments: cycleAssignedPayments
      };
    });
  }, [loanSchedule, grossAmountReceived, activeLoanProfile, historicalPayments]);

  const portfolioPenaltyAudit = useMemo(() => {
    return cleanScheduleWithAllocatedPayments.reduce((acc, sch) => {
      const penaltyComp = Number(sch.displayPenaltyComp || 0);
      const penaltyPaid = Number(sch.penalty_paid || 0);
      if (sch.computedStatus === "OVERDUE" || (penaltyComp - penaltyPaid > 0)) {
        acc.totalUnpaidPenalty += Math.max(0, penaltyComp - penaltyPaid);
        acc.overdueInstallmentsCount += 1;
      }
      return acc;
    }, { totalUnpaidPenalty: 0, overdueInstallmentsCount: 0 });
  }, [cleanScheduleWithAllocatedPayments]);

  const hoveredEmiDetails = useMemo(() => {
    if (!hoveredEmiId) return null;
    const emi = cleanScheduleWithAllocatedPayments.find(s => String(s.id) === String(hoveredEmiId));
    if (!emi) return null;
    
    return { emi, payments: emi.assignedPayments || [] };
  }, [hoveredEmiId, cleanScheduleWithAllocatedPayments]);

  return (
    <div className="nbfc-container">
      {banner.text && <div className={`nbfc-toast alert-${banner.type}`}>{banner.text}</div>}
      <div className="nbfc-header">
        <h2>Enterprise Loan Counter Settlement Terminal</h2>
        <p>Post direct counter payments with accurate reducing balance attribution and progressive balance clearance.</p>
      </div>

      <form onSubmit={handleSearchLookup} className="nbfc-search-bar">
        <div className="search-field">
          <label>Loan Account ID Reference</label>
          <input type="text" placeholder="e.g. 104" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="mono" />
        </div>
        <button type="submit" className="nbfc-btn query">Fetch Ledger Profile</button>
      </form>

      {activeLoanProfile ? (
        <>
          <div className="nbfc-preview-box" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, color: '#f8fafc' }}>Active Account Summary (File #{activeLoanProfile.id})</h4>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sanctioned Principal: ₹{Math.round(Number(activeLoanProfile.principal_amount || 0)).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Paid/Collected So Far</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>₹{Math.round(totalLoanCollection).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="nbfc-workspace-grid" style={{ alignItems: 'stretch' }}>
            <div className="nbfc-card col-form" style={{ height: '100%' }}>
              <h3>📥 Counter Cash Settlement Posting</h3>
              {portfolioPenaltyAudit.overdueInstallmentsCount > 0 && (
                <div className="nbfc-preview-box" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '15px' }}>
                  <h4 className="text-red">⚠️ Overdue Audit Alert</h4>
                  <div className="p-row text-red"><span>Overdue Cycles:</span><span>{portfolioPenaltyAudit.overdueInstallmentsCount}</span></div>
                  <div className="p-row text-red"><span>Accumulated Penalty:</span><span>₹{Math.round(portfolioPenaltyAudit.totalUnpaidPenalty).toLocaleString('en-IN')}</span></div>
                </div>
              )}
              <form onSubmit={handleManualPaymentSubmit} className="nbfc-form-stack">
                <div className="form-group highlight">
                  <label>1. Total Combined Cash Received (₹)</label>
                  <input type="number" required min="1" step="any" placeholder="0.00" value={grossAmountReceived} onChange={e => setGrossAmountReceived(e.target.value)} />
                </div>
                <div className="form-row-2x">
                  <div className="form-group">
                    <label className="text-red">2. Penalty / Late Charges (₹)</label>
                    <input type="number" min="0" step="any" placeholder="0" className="text-red" value={penaltyCharge} onChange={e => setPenaltyCharge(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="text-amber">3. Delay Interest Rate (% Per Annum)</label>
                    <input type="number" min="0" step="any" placeholder="e.g. 24" className="text-amber" value={delayInterestRate} onChange={e => setDelayInterestRate(e.target.value)} />
                  </div>
                </div>
                <div className="nbfc-preview-box">
                  <h4>System Allocation Parameters</h4>
                  <div className="p-row"><span>Gross Funds Collected:</span><span>₹{Math.round(parseFloat(grossAmountReceived || 0)).toLocaleString('en-IN')}</span></div>
                  <div className="p-row text-red"><span>Deducted Late Fees:</span><span>- ₹{Math.round(parseFloat(penaltyCharge || 0)).toLocaleString('en-IN')}</span></div>
                </div>
                <div className="form-row-2x">
                  <div className="form-group">
                    <label>Reconciliation Mode</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                      <option value="CASH">Counter Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
                      <option value="UPI">UPI Digital Ledger</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>UTR Reference Code</label>
                    <input type="text" placeholder="Transaction ID Reference" value={referenceNum} onChange={(e) => setReferenceNum(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reconciliation Value Date</label>
                  <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
                <button type="submit" className="nbfc-btn commit" disabled={!ledgerBreakdown.isValid || !grossAmountReceived || isSubmitting}>
                  {isSubmitting ? "Updating Core Ledgers..." : "Post Transaction & Clear Cycle Balance"}
                </button>
              </form>
            </div>

            <div className="nbfc-card col-ledger" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div 
                style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}
                onMouseLeave={() => setHoveredEmiId(null)}
              >
                <h3>📅 Dynamic Account Amortization Status</h3>
                {hoveredEmiDetails && (
                  <div 
                    className="nbfc-preview-box" 
                    onMouseEnter={() => setHoveredEmiId(hoveredEmiDetails.emi.id)}
                    style={{ 
                      position: 'absolute', 
                      right: '0', 
                      top: '32px', 
                      width: '380px', 
                      background: '#1e293b', 
                      border: '1px solid #475569', 
                      zIndex: 100, 
                      padding: '16px', 
                      maxHeight: '340px', 
                      overflowY: 'auto' 
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', fontSize: '13px', color: '#f8fafc' }}>
                      EMI #{hoveredEmiDetails.emi.installment_no} • Reducing Balance Audit
                    </h4>
                    <div className="p-row text-red"><span>Late Fee:</span><span>₹{Math.round(Number(hoveredEmiDetails.emi.penalty_paid || 0))}/₹{Math.round(Number(hoveredEmiDetails.emi.displayPenaltyComp || 0))}</span></div>
                    <div className="p-row text-amber"><span>Interest:</span><span>₹{Math.round(Number(hoveredEmiDetails.emi.interest_paid || 0))}/₹{Math.round(Number(hoveredEmiDetails.emi.displayInterestComp || 0))}</span></div>
                    <div className="p-row"><span>Principal:</span><span>₹{Math.round(Number(hoveredEmiDetails.emi.principal_paid || 0))}/₹{Math.round(Number(hoveredEmiDetails.emi.displayPrincipalComp || 0))}</span></div>
                    <div className="p-row text-blue" style={{ fontSize: '11px', color: '#38bdf8' }}><span>Declining Principal Balance:</span><span>₹{Math.round(hoveredEmiDetails.emi.endingPrincipalBalance || 0).toLocaleString('en-IN')}</span></div>
                    <div className="p-row text-emerald" style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}><span>Recovered in EMI #{hoveredEmiDetails.emi.installment_no}:</span><span>₹{Math.round(hoveredEmiDetails.emi.currentCycleRecovered || 0).toLocaleString('en-IN')}</span></div>
                    <div className="p-row text-purple" style={{ fontSize: '11px', color: '#c084fc' }}><span>Cumulative Recovered (Till #{hoveredEmiDetails.emi.installment_no}):</span><span>₹{Math.round(hoveredEmiDetails.emi.cumulativeRecoveredTillHere || 0).toLocaleString('en-IN')}</span></div>
                    
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        Transactions Linked to EMI #{hoveredEmiDetails.emi.installment_no} ({hoveredEmiDetails.payments.length}):
                      </span>
                      {hoveredEmiDetails.payments.length === 0 ? (
                        <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No historical receipts posted for this specific EMI.</span>
                      ) : (
                        hoveredEmiDetails.payments.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '4px', marginTop: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{p.payment_mode || 'CASH'}</span>
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{Math.round(Number(p.amount || 0)).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Ref: {p.transaction_reference || 'N/A'}</span>
                              <span>{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : ''}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="ledger-table-container" style={{ flex: 1, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>Inst.</th><th>Installment Due Breakdown</th><th style={{textAlign: 'right'}}>Status</th></tr>
                    </thead>
                    <tbody>
                      {cleanScheduleWithAllocatedPayments.map((sch) => (
                        <tr key={sch.id} onMouseEnter={() => setHoveredEmiId(sch.id)} style={{ cursor: 'pointer' }}>
                          <td className="mono">#{sch.installment_no}</td>
                          <td>
                            <div className="due-header">EMI: ₹{Math.round(Number(sch.dynamicTotalEmi || 0)).toLocaleString('en-IN')} (Due: {sch.due_date ? new Date(sch.due_date).toLocaleDateString('en-IN') : 'N/A'})</div>
                            <div className="split-pills">
                              <span className="pill-p text-red">Fee: ₹{Math.round(Number(sch.penalty_paid || 0))}/{Math.round(Number(sch.displayPenaltyComp || 0))}</span>
                              <span className="pill-i">Int: ₹{Math.round(Number(sch.interest_paid || 0))}/{Math.round(Number(sch.displayInterestComp || 0))}</span>
                              <span className="pill-pr">Prin: ₹{Math.round(Number(sch.principal_paid || 0))}/{Math.round(Number(sch.displayPrincipalComp || 0))}</span>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}}><span className={`status-tag ${sch.computedStatus.toLowerCase()}`}>{sch.computedStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="nbfc-empty-state">
          <h4>No Account Portfolio Active</h4>
          <p>Search for an active document file reference ID above to open real-time accounting panels.</p>
        </div>
      )}
    </div>
  );
}

export default Payments;