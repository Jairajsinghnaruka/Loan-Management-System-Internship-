import React, { useState, useEffect } from "react";
import "./CustomerProfile.css";

function CustomerProfile({ customer: initialCustomer, setView }) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialCustomer?.id) return;

    const fetchProfileData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const resProfile = await fetch(`http://localhost:4000/api/customers/${initialCustomer.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataProfile = await resProfile.json();
        if (dataProfile.success) {
          setCustomer(dataProfile.customer);
        }

        const resLoans = await fetch(`http://localhost:4000/api/customers/${initialCustomer.id}/loans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataLoans = await resLoans.json();
        if (dataLoans.success) {
          setCustomerLoans(dataLoans.loans || []);
        }
      } catch (error) {
        console.error("Profile compilation error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [initialCustomer?.id]);

  if (!customer) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <button type="button" className="back-btn" onClick={() => setView("Customers")}>
            ← Back to Customers
          </button>
        </div>
        <div className="profile-card">
          <p style={{ color: "#94a3b8", textAlign: "center" }}>No customer profile active.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ color: "#94a3b8", textAlign: "center" }}>Compiling profile records...</p>
        </div>
      </div>
    );
  }

  const activeLoans = customerLoans.filter((loan) => loan?.status?.toUpperCase() === "ACTIVE");
  const pendingLoans = customerLoans.filter((loan) => loan?.status?.toUpperCase() === "PENDING");
  const overdueLoans = customerLoans.filter((loan) => loan?.status?.toUpperCase() === "OVERDUE");

  const totalBorrowed = customerLoans.reduce(
    (sum, loan) => sum + Number(loan?.principal_amount || loan?.amount || 0),
    0
  );

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:4000/api/customers/${customer.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setView("Customers");
        } else {
          alert(data.message || "Failed to purge record");
        }
      } catch (error) {
        alert("Server communication failure");
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => setView("Customers")}
        >
          ← Back
        </button>

        <button
          type="button"
          className="delete-btn"
          onClick={handleDelete}
        >
          Delete Customer
        </button>
      </div>

      <div className="profile-card">
        <h2>{customer.name}</h2>
        <div className="customer-info">
          <div>
            <span>ID</span>
            <p>#{customer.id}</p>
          </div>

          <div>
            <span>Email</span>
            <p>{customer.email || "N/A"}</p>
          </div>

          <div>
            <span>Phone</span>
            <p>{customer.phone || "N/A"}</p>
          </div>

          <div>
            <span>PAN</span>
            <p>{customer.pan || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Loans</h4>
          <span>{customerLoans.length}</span>
        </div>

        <div className="stat-card active">
          <h4>Active Loans</h4>
          <span>{activeLoans.length}</span>
        </div>

        <div className="stat-card pending">
          <h4>Pending Loans</h4>
          <span>{pendingLoans.length}</span>
        </div>

        <div className="stat-card overdue">
          <h4>Overdue Loans</h4>
          <span>{overdueLoans.length}</span>
        </div>
      </div>

      <div className="profile-card">
        <h3>Total Borrowed Amount</h3>
        <div className="amount">
          ₹{totalBorrowed.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="profile-card">
        <h3>Loan History</h3>
        <div className="table-wrapper">
          <table className="loan-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customerLoans.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    No loans found
                  </td>
                </tr>
              ) : (
                customerLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.loan_number || loan.id}</td>
                    <td>{loan.loan_type || loan.type || "Personal"}</td>
                    <td>
                      ₹{Number(loan.principal_amount || loan.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`status ${(loan.status || "Pending").toLowerCase()}`}>
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
    </div>
  );
}

export default CustomerProfile;