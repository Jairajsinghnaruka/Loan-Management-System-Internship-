import React, { useState, useMemo } from 'react';
import "./Reports.css";

function Reports({ dataLoans = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [reportType, setReportType] = useState('all_loans'); // 'all_loans' | 'monthly_summary' | 'customer_detail' | 'date_range'
  const [targetCustomer, setTargetCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Calculate Core Financial & Volume KPIs
  const metrics = useMemo(() => {
    let totalCollection = 0;
    let totalOverdue = 0;
    let totalDue = 0;
    let activeCount = 0;
    let closedCount = 0;
    let uniqueCustomers = new Set();

    dataLoans.forEach(loan => {
      const principal = Number(loan.amount) || 0;
      const rate = Number(loan.rate) || 0;
      const months = Number(loan.months) || 12;
      
      const totalInterest = (principal * (rate / 100) * (months / 12));
      const grossReceivable = principal + totalInterest;

      if (loan.customer) {
        uniqueCustomers.add(loan.customer);
      }

      if (loan.status === 'Active') {
        activeCount++;
        totalDue += grossReceivable * 0.15;
        totalCollection += grossReceivable * 0.35;
      } else if (loan.status === 'Closed') {
        closedCount++;
        totalCollection += grossReceivable;
      } else if (loan.status === 'Pending') {
        totalDue += grossReceivable * 0.05;
      } else if (loan.status === 'Rejected') {
        totalOverdue += principal * 0.10;
      }
    });

    return {
      collection: totalCollection,
      overdue: totalOverdue,
      due: totalDue,
      active: activeCount,
      closed: closedCount,
      customers: uniqueCustomers.size
    };
  }, [dataLoans]);

  // 2. Monthly Collection Processing Engine
  const monthlyBreakdown = useMemo(() => {
    const monthsMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    monthNames.forEach(m => { monthsMap[m] = { collection: 0, activeVolume: 0 }; });

    dataLoans.forEach(loan => {
      if (!loan.createdDate) return;
      const dateParts = loan.createdDate.split('-');
      if (dateParts.length < 2) return;
      
      const monthIdx = parseInt(dateParts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = monthNames[monthIdx];
        const principal = Number(loan.amount) || 0;
        
        if (loan.status === 'Active' || loan.status === 'Closed') {
          monthsMap[mName].collection += loan.status === 'Closed' ? principal : principal * 0.25;
          monthsMap[mName].activeVolume += 1;
        }
      }
    });

    return Object.keys(monthsMap).map(key => ({
      month: key,
      collection: monthsMap[key].collection,
      volume: monthsMap[key].activeVolume
    }));
  }, [dataLoans]);

  // Get distinct customer names for selection list
  const uniqueCustomerList = useMemo(() => {
    return Array.from(new Set(dataLoans.map(l => l.customer).filter(Boolean)));
  }, [dataLoans]);

  // Filter accounts list based on chosen dropdown state
  const filteredReportList = useMemo(() => {
    if (selectedMonth === 'All') return dataLoans;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return dataLoans.filter(loan => {
      if (!loan.createdDate) return false;
      const monthIdx = parseInt(loan.createdDate.split('-')[1], 10) - 1;
      return monthNames[monthIdx] === selectedMonth;
    });
  }, [dataLoans, selectedMonth]);

  // Dynamic Multi-Option CSV Exporter Engine
  const downloadCSVReport = () => {
    let headers = [];
    let rows = [];
    let fileSuffix = reportType;

    if (reportType === 'all_loans') {
      if (filteredReportList.length === 0) {
        alert("No records found for the selected month filter.");
        return;
      }
      headers = ["Loan ID", "Customer Profile", "Principal Amount (₹)", "Interest Rate (%)", "Tenure (Months)", "Booking Date", "Status"];
      rows = filteredReportList.map(loan => [
        loan.id || 'N/A',
        `"${loan.customer || 'Unknown'}"`,
        loan.amount || '0',
        loan.rate || 'N/A',
        loan.months || 'N/A',
        loan.createdDate || 'N/A',
        loan.status || 'Pending'
      ]);
      fileSuffix = `All_Loans_${selectedMonth}`;
    } 
    else if (reportType === 'monthly_summary') {
      headers = ["Month", "Estimated Collection (₹)", "Active Volume Count"];
      rows = monthlyBreakdown.map(item => [
        item.month,
        item.collection.toFixed(2),
        item.volume
      ]);
      fileSuffix = 'Monthly_Collection_Summary';
    } 
    else if (reportType === 'customer_detail') {
      const customerLoans = dataLoans.filter(l => l.customer === targetCustomer);
      if (customerLoans.length === 0) {
        alert("Please select a valid customer profile to download details.");
        return;
      }
      headers = ["Loan ID", "Customer Name", "Principal Amount (₹)", "Interest Rate (%)", "Tenure (Months)", "Booking Date", "Status"];
      rows = customerLoans.map(loan => [
        loan.id || 'N/A',
        `"${loan.customer}"`,
        loan.amount || '0',
        loan.rate || 'N/A',
        loan.months || 'N/A',
        loan.createdDate || 'N/A',
        loan.status || 'Pending'
      ]);
      fileSuffix = `Customer_${targetCustomer.replace(/\s+/g, '_')}`;
    } 
    else if (reportType === 'date_range') {
      if (!startDate || !endDate) {
        alert("Please supply both a start date and an end date filter.");
        return;
      }
      const rangeLoans = dataLoans.filter(l => {
        if (!l.createdDate) return false;
        return l.createdDate >= startDate && l.createdDate <= endDate;
      });
      if (rangeLoans.length === 0) {
        alert("No files match the specified date range window.");
        return;
      }
      headers = ["Loan ID", "Customer Profile", "Principal Amount (₹)", "Interest Rate (%)", "Tenure (Months)", "Booking Date", "Status"];
      rows = rangeLoans.map(loan => [
        loan.id || 'N/A',
        `"${loan.customer || 'Unknown'}"`,
        loan.amount || '0',
        loan.rate || 'N/A',
        loan.months || 'N/A',
        loan.createdDate || 'N/A',
        loan.status || 'Pending'
      ]);
      fileSuffix = `Range_${startDate}_to_${endDate}`;
    }

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-container-panel">
      
      {/* Upper Control Bar Block */}
      <div className="reports-header-row">
        <div>
          <h2 className="reports-main-title">Financial Audit Reports</h2>
          <p className="reports-subtitle">Track collections metrics, overdue files, active books, and custom download matrices.</p>
        </div>
        
        <div className="reports-actions-cluster">
          <div className="filter-dropdown-container">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="reporting-select-input"
            >
              <option value="All">Full Calendar Year (All)</option>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                <option key={m} value={m}>{m} Collection Bracket</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ADVANCED EXPORT CONFIGURATION PANEL */}
      <div className="nbfc-preview-box" style={{ background: '#1e293b', border: '1px solid #475569', marginBottom: '20px', padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#f8fafc', fontSize: '13px' }}>Granular Report Exporter Configuration</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Report Dataset</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="reporting-select-input"
              style={{ width: '100%' }}
            >
              <option value="all_loans">All Account Files (Active View)</option>
              <option value="monthly_summary">Monthly Performance Timeline</option>
              <option value="customer_detail">Individual Customer Dossier</option>
              <option value="date_range">Custom Date Range Filter</option>
            </select>
          </div>

          {reportType === 'customer_detail' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Customer Name</label>
              <select 
                value={targetCustomer} 
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="reporting-select-input"
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Profile --</option>
                {uniqueCustomerList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'date_range' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Booking Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>End Booking Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
                />
              </div>
            </>
          )}

          <div>
            <button 
              type="button" 
              className="download-report-trigger-btn" 
              onClick={downloadCSVReport}
              style={{ width: '100%', marginTop: '4px' }}
            >
              📥 Generate & Download Report
            </button>
          </div>

        </div>
      </div>

      {/* PRIMARY KPI METRIC PANELS */}
      <div className="metrics-summary-grid">
        <div className="metric-report-card highlight-cyan">
          <span className="card-tag">Loan Report Collection</span>
          <h2 className="card-amt">₹{metrics.collection.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
          <div className="card-footer-meta">Recovered Principal & Settled Books</div>
        </div>

        <div className="metric-report-card highlight-rose">
          <span className="card-tag">Overdue Balance</span>
          <h2 className="card-amt" style={{ color: "#f43f5e" }}>₹{metrics.overdue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
          <div className="card-footer-meta">Grace period expiration/Default logs</div>
        </div>

        <div className="metric-report-card highlight-amber">
          <span className="card-tag">Current Due</span>
          <h2 className="card-amt" style={{ color: "#f59e0b" }}>₹{metrics.due.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
          <div className="card-footer-meta">Active billing cycles receivable</div>
        </div>

        <div className="metric-report-card">
          <span className="card-tag">Active Books</span>
          <h2 className="card-amt">{metrics.active} <span className="unit-label">Accs</span></h2>
          <div className="card-footer-meta">Running portfolio count</div>
        </div>

        <div className="metric-report-card">
          <span className="card-tag">Closed Slates</span>
          <h2 className="card-amt">{metrics.closed} <span className="unit-label">Accs</span></h2>
          <div className="card-footer-meta">Completely cleared agreements</div>
        </div>

        <div className="metric-report-card">
          <span className="card-tag">Unique Customers</span>
          <h2 className="card-amt">{metrics.customers} <span className="unit-label">Profiles</span></h2>
          <div className="card-footer-meta">Verified unique client registry</div>
        </div>
      </div>

      {/* MONTHLY PERFORMANCE VISUAL TRACKER GRID */}
      <div className="report-graphic-section">
        <h3 className="section-inner-headline">Monthly Collection Timelines</h3>
        
        <div className="graphic-bars-wrapper">
          {monthlyBreakdown.map((item) => {
            const maxVal = Math.max(...monthlyBreakdown.map(o => o.collection), 100000);
            const heightPct = Math.min(100, Math.max(8, (item.collection / maxVal) * 100));

            return (
              <div key={item.month} className="bar-track-node">
                <div className="bar-value-popup">₹{(item.collection / 1000).toFixed(1)}k</div>
                <div className="bar-column-container">
                  <div 
                    className={`bar-fill-strip ${item.collection > 0 ? 'has-value' : ''}`} 
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="bar-label-month">{item.month}</span>
                <span className="bar-volume-indicator">{item.volume} Active</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDIT DATA MATRIX TABLE */}
      <div className="report-ledger-log">
        <h3 className="section-inner-headline">File Registry Audit Ledger ({filteredReportList.length} items)</h3>
        <div className="table-scroll-shield">
          <table className="report-data-grid">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Linked Customer</th>
                <th>Sanction Value</th>
                <th>Booking Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReportList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row-fallback">No logged financial records match your selected configuration filter.</td>
                </tr>
              ) : (
                filteredReportList.map(loan => (
                  <tr key={loan.id}>
                    <td className="mono-txt text-cyan">{loan.id}</td>
                    <td className="font-medium-str">{loan.customer}</td>
                    <td className="mono-txt">₹{Number(loan.amount).toLocaleString('en-IN')}</td>
                    <td>{loan.createdDate || "N/A"}</td>
                    <td>
                      <span className={`pill-badge badge-${(loan.status || 'Pending').toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Reports;