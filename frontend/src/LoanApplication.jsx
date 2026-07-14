import React, { useState } from 'react';
import "./LoanApplication.css";

function LoanApplication({ 
  onSubmit, 
  dataCust = [], 
  dataLoans = [], 
  onUpdateLoanStatus,
  onDeleteLoan 
}) {
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchLoanId, setSearchLoanId] = useState('');
  const [activeTab, setActiveTab] = useState('All'); 

  const [form, setForm] = useState({ 
    customer_id: '',
    customerName: '', 
    principal_amount: '100000', 
    interest_rate: '10.5', 
    tenure_months: '12', 
    loan_type: 'PERSONAL',
    createdDate: new Date().toISOString().slice(0, 10) 
  });
  
  const [successMessage, setSuccessMessage] = useState("");

  const stats = {
    total: dataLoans ? dataLoans.length : 0,
    active: dataLoans ? dataLoans.filter(l => l?.status === 'APPROVED' || l?.status === 'ACTIVE').length : 0,
    pending: dataLoans ? dataLoans.filter(l => l?.status === 'PENDING' || !l?.status).length : 0,
    closed: dataLoans ? dataLoans.filter(l => l?.status === 'CLOSED').length : 0,
    rejected: dataLoans ? dataLoans.filter(l => l?.status === 'REJECTED').length : 0
  };

  const matchingCustomers = searchCustomer.trim() === "" 
    ? [] 
    : dataCust.filter(c => c?.name?.toLowerCase().includes(searchCustomer.toLowerCase()));

  const filteredLoans = (dataLoans || []).filter(loan => {
    const currentStatus = loan?.status ? loan.status.toUpperCase() : 'PENDING';
    let targetTab = activeTab.toUpperCase();
    if (targetTab === 'ACTIVE') targetTab = 'APPROVED';
    
    const matchesTab = targetTab === 'ALL' || currentStatus === targetTab;

    if (searchLoanId.trim() === "") return matchesTab;

    const loanIdString = loan?.id ? String(loan.id).toLowerCase() : "";
    const customerNameString = loan?.customer_name ? String(loan.customer_name).toLowerCase() : "";
    const cleanSearchQuery = searchLoanId.toLowerCase();

    return (loanIdString.includes(cleanSearchQuery) || customerNameString.includes(cleanSearchQuery)) && matchesTab;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      alert("Please choose and verify a registered customer profile from the search list first.");
      return;
    }

    onSubmit({
      customer_id: Number(form.customer_id),
      principal_amount: parseFloat(form.principal_amount) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      tenure_months: parseInt(form.tenure_months) || 12,
      loan_type: form.loan_type
    });

    setForm({
      customer_id: '',
      customerName: '',
      principal_amount: '100000',
      interest_rate: '10.5',
      tenure_months: '12',
      loan_type: 'PERSONAL',
      createdDate: new Date().toISOString().slice(0, 10)
    });
    setSearchCustomer('');
    setSuccessMessage(`Loan Application File Created for ${form.customerName}!`);

    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="loan-app-module">
      <div className="loan-app-stats-grid">
        <div className="app-mini-card"><h5>Total Requests</h5><h3>{stats.total}</h3></div>
        <div className="app-mini-card active-border"><h5>Active Books</h5><h3 style={{ color: "#10b981" }}>{stats.active}</h3></div>
        <div className="app-mini-card pending-border"><h5>Awaiting Decision</h5><h3 style={{ color: "#f59e0b" }}>{stats.pending}</h3></div>
        <div className="app-mini-card closed-border"><h5>Settled / Closed</h5><h3 style={{ color: "#94a3b8" }}>{stats.closed}</h3></div>
        <div className="app-mini-card rejected-border"><h5>Rejected Slates</h5><h3 style={{ color: "#f43f5e" }}>{stats.rejected}</h3></div>
      </div>

      <div className="loan-app-split-layout">
        <div className="loan-form-panel">
          <div className="panel-inner-title" style={{ marginTop: 0 }}>New Loan Entry</div>
          {successMessage && <div className="form-alert-banner">{successMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className="verification-section" style={{ marginBottom: "14px" }}>
              <label className="form-label-tag">Verify Registered Profile Link Name</label>
              <input type="text" className="form-input-field search-profile-box" placeholder="Type name to verify database profile registry..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
              {matchingCustomers.length > 0 && (
                <div className="profile-match-dropdown">
                  <ul className="match-suggestions-list">
                    {matchingCustomers.map(c => (
                      <li key={c.id}>
                        <button type="button" className="suggestion-item-btn" onClick={() => { setForm({ ...form, customer_id: c.id, customerName: c.name }); setSearchCustomer(c.name); }}>
                          <span className="font-bold">{c.name}</span>
                          <span className="suggestion-item-meta">PAN: {c.pan || 'N/A'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {form.customerName && <div style={{ fontSize: "11px", color: "#22d3ee", marginTop: "6px", fontWeight: "600" }}>Linked Target Account: {form.customerName} (ID: #{form.customer_id})</div>}
            </div>

            <div className="form-grid-2x2">
              <div><label className="form-label-tag">Sanction Principal (₹)</label><input type="number" className="form-input-field" value={form.principal_amount} required onChange={(e) => setForm({...form, principal_amount: e.target.value})} /></div>
              <div><label className="form-label-tag">Sanction Booking Date</label><input type="date" className="form-input-field" value={form.createdDate} required onChange={(e) => setForm({...form, createdDate: e.target.value})} /></div>
            </div>

            <div className="form-grid-2x2">
              <div><label className="form-label-tag">ROI (Per Annum %)</label><input type="number" step="0.1" className="form-input-field" value={form.interest_rate} required onChange={(e) => setForm({...form, interest_rate: e.target.value})} /></div>
              <div><label className="form-label-tag">Tenure (Months)</label><input type="number" className="form-input-field" value={form.tenure_months} required onChange={(e) => setForm({...form, tenure_months: e.target.value})} /></div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="form-label-tag">Loan Category Type</label>
              <select className="form-input-field" value={form.loan_type} onChange={(e) => setForm({...form, loan_type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "4px", backgroundColor: "#1f2937", color: "#fff", border: "1px solid #374151" }}>
                <option value="PERSONAL">Personal Loan</option>
                <option value="HOME">Home Loan</option>
                <option value="VEHICLE">Vehicle Loan</option>
                <option value="BUSINESS">Business Capital</option>
              </select>
            </div>
            <button type="submit" className="form-submit-action-btn">⚡ Generate Application File</button>
          </form>
        </div>

        <div className="loan-ledger-panel">
          <div className="ledger-header-controls">
            <div className="panel-inner-title" style={{ margin: 0 }}>Underwriting Desk Tracking</div>
            <input type="text" className="ledger-search-box" placeholder="Filter list by ID or Customer Name..." value={searchLoanId} onChange={(e) => setSearchLoanId(e.target.value)} />
            <div className="ledger-tabs-row">
              {['All', 'Pending', 'Active', 'Closed', 'Rejected'].map(tab => (
                <button key={tab} type="button" className={`tab-node ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>
          </div>

          <div className="ledger-table-scroll-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>ID / Date</th>
                  <th>Customer Profile Reference</th>
                  <th>Principal</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Verdict Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.length === 0 ? (
                  <tr><td colSpan="5" className="ledger-empty">No matching loans located under this structural view.</td></tr>
                ) : (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id || Math.random()}>
                      <td>
                        <div className="mono" style={{ color: "#94a3b8" }}>#{loan.id}</div>
                        <div className="ledger-loan-meta">{loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-IN') : loan.bookingDate}</div>
                      </td>
                      <td>
                        <div className="ledger-cust-name">{loan.customer_name || loan.customer}</div>
                        {loan.loan_type && <div className="ledger-loan-meta">Type: {loan.loan_type}</div>}
                      </td>
                      <td>
                        <strong style={{ color: "#10b981" }}>₹{Number(loan.principal_amount || 0).toLocaleString('en-IN')}</strong>
                        <div className="ledger-loan-meta">{loan.interest_rate}% APR / {loan.tenure_months}M</div>
                      </td>
                      <td><span className={`badge badge-${(loan.status || 'PENDING').toLowerCase()}`}>{loan.status || 'PENDING'}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div className="decision-btn-cluster">
                          {(loan.status?.toUpperCase() === 'PENDING' || !loan.status) && (
                            <>
                              <button type="button" className="verdict-btn v-approve" onClick={() => onUpdateLoanStatus(loan.id, 'APPROVED')}>✓</button>
                              <button type="button" className="verdict-btn v-reject" onClick={() => onUpdateLoanStatus(loan.id, 'REJECTED')}>✕</button>
                            </>
                          )}
                          {loan.status?.toUpperCase() !== 'APPROVED' && (
                            <button type="button" className="verdict-btn v-delete" style={{ backgroundColor: '#f43f5e', color: 'white', marginLeft: '5px' }} onClick={() => { if(window.confirm("Confirm delete?")) onDeleteLoan(loan.id); }}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanApplication;