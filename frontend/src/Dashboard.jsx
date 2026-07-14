import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard({ setView, toggleSidebar }) {
  const [search, setSearch] = useState("");
  const [showEmi, setShowEmi] = useState(false);
  const [p, setP] = useState(200000);
  const [r, setR] = useState(9.5);
  const [m, setM] = useState(24);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    activeLoans: 0,
    closedLoans: 0,
    pendingLoans: 0,
    totalCollections: 0,
    outstandingBalance: 0,
    monthlyCollections: 0,
    overdueInstallments: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const resStats = await fetch("http://localhost:4000/api/dashboard", { headers });
        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.stats);
      } catch (e) {}
      try {
        const resLoans = await fetch("http://localhost:4000/api/dashboard/recent-loans", { headers });
        const dataLoansRes = await resLoans.json();
        if (dataLoansRes.success) setRecentLoans(dataLoansRes.loans);
      } catch (e) {}
      try {
        const resDist = await fetch("http://localhost:4000/api/dashboard/loan-distribution", { headers });
        const dataDist = await resDist.json();
        if (dataDist.success) setDistribution(dataDist.distribution);
      } catch (e) {}
    };
    fetchDashboardData();
  }, []);

  const mRate = r / 12 / 100;
  const emiVal = mRate === 0 ? p / m : (p * mRate * Math.pow(1 + mRate, m)) / (Math.pow(1 + mRate, m) - 1);
  const totalRepay = emiVal * m;
  const totalInterest = totalRepay - p;

  const filteredLoans = recentLoans.filter(
    (loan) =>
      loan?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(loan?.id).toLowerCase().includes(search.toLowerCase()) ||
      loan?.loan_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-main-content">
      <div className="top-bar">
        <div className="search-and-menu-group">
          <button type="button" className="sidebar-toggle-btn" onClick={toggleSidebar}>
            ☰ Menu
          </button>
          <input
            type="text"
            placeholder="Search by Loan ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
          />
        </div>
        <div className="action-buttons">
          <button type="button" className="btn-secondary" onClick={() => setView("Create Customer")}>
            👤 Create Customer
          </button>
          <button type="button" className="btn-primary" onClick={() => setView("Loan Application")}>
            ➕ New Loan
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowEmi(true)}>
            🧮 EMI Calculator
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Portfolio Balance</h4>
          <h2>₹ {Number(stats.outstandingBalance || 0).toLocaleString("en-IN")}</h2>
        </div>
        <div className="stat-card">
          <h4>Active Books</h4>
          <h2>{stats.activeLoans || 0}</h2>
        </div>
        <div className="stat-card">
          <h4>Pending Release</h4>
          <h2>{stats.pendingLoans || 0}</h2>
        </div>
        <div className="stat-card">
          <h4>Overdue Cases</h4>
          <h2>{stats.overdueInstallments || 0}</h2>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Current Month Collection Ledger</h3>
          <div className="big-number">₹ {Number(stats.monthlyCollections || 0).toLocaleString("en-IN")}</div>
          <p>Real-time gross clearing metrics recorded this calendar month</p>
        </div>
        <div className="analytics-card">
          <h3>Portfolio Category Distribution</h3>
          <div className="distribution">
            {distribution.length > 0 ? (
              distribution.map((dist, idx) => (
                <div key={idx}>
                  <span>{dist.loan_type || "Standard Asset Class"}</span>
                  <strong>{dist.total}</strong>
                </div>
              ))
            ) : (
              <>
                <div><span>Active Allocations</span><strong>{stats.activeLoans || 0}</strong></div>
                <div><span>Pipeline Underwriting</span><strong>{stats.pendingLoans || 0}</strong></div>
                <div><span>Delinquent Assets</span><strong>{stats.overdueInstallments || 0}</strong></div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-grid additional-metrics-row">
        <div className="analytics-card payment-collection-card">
          <h3>Cumulative Clearing Aggregates</h3>
          <div className="collection-subtext-grid">
            <div className="subtext-item">
              <span>Gross Recovered Capital:</span>
              <strong style={{ color: "#10b981" }}>₹ {Number(stats.totalCollections || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div className="subtext-item">
              <span>Registered System Base Clients:</span>
              <strong style={{ color: "#06b6d4" }}>{stats.totalCustomers || 0} Accounts</strong>
            </div>
          </div>
        </div>
        <div className="analytics-card date-distribution-card">
          <h3>Historical Asset Processing Status</h3>
          <div className="distribution">
            <div><span>Total Lifecycle Loans:</span><strong>{stats.totalLoans || 0} Rows</strong></div>
            <div><span>Settled/Closed Books:</span><strong>{stats.closedLoans || 0} Rows</strong></div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3>Recent Operations Audit Ledger</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Customer Entity</th>
                <th>Principal Base</th>
                <th>Asset Type</th>
                <th>Processing Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8" }}>No Records Found</td>
                </tr>
              ) : (
                filteredLoans.slice(0, 8).map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.loan_number || loan.id}</td>
                    <td>{loan.customer_name}</td>
                    <td>₹ {Number(loan.principal_amount || 0).toLocaleString("en-IN")}</td>
                    <td>{loan.loan_type || "Standard"}</td>
                    <td>
                      <span className={`status status-${(loan.status || "Pending").toLowerCase()}`}>
                        {loan.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEmi && (
        <div className="emi-overlay" onClick={() => setShowEmi(false)}>
          <div className="emi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emi-header">
              <h3>EMI Calculator</h3>
              <button type="button" className="close-btn" onClick={() => setShowEmi(false)}>✖</button>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "#94a3b8" }}>Principal Base</span>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>₹{p.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="10000" max="2500000" step="10000" value={p} onChange={e => setP(Number(e.target.value))} style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "#94a3b8" }}>Interest (ROI)</span>
                <span style={{ color: "#06b6d4", fontWeight: "bold" }}>{r}% p.a.</span>
              </div>
              <input type="range" min="5" max="28" step="0.25" value={r} onChange={e => setR(Number(e.target.value))} style={{ width: "100%", accentColor: "#06b6d4", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "#94a3b8" }}>Tenure Lock</span>
                <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{m} Months</span>
              </div>
              <input type="range" min="6" max="120" step="6" value={m} onChange={e => setM(Number(e.target.value))} style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }} />
            </div>
            <div className="emi-result">
              <p>Monthly Installment: <span style={{ color: "#10b981" }}>₹{isNaN(emiVal) ? '0' : Math.round(emiVal).toLocaleString('en-IN')}</span></p>
              <p>Total Interest: <span>₹{Math.round(totalInterest).toLocaleString('en-IN')}</span></p>
              <p>Gross Repayment: <span style={{ color: "#06b6d4" }}>₹{Math.round(totalRepay).toLocaleString('en-IN')}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;