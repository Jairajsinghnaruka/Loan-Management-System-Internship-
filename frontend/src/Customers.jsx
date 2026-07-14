import React, { useState, useEffect } from "react";
import "./Customers.css";

function Customers({
  dataLoans = [], 
  setView,
  setSelectedCustomer,
}) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch customers from backend with live server-side searching
  const fetchCustomers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Hits your exact controller endpoint: /api/customers?search=...
      const response = await fetch(`http://localhost:4000/api/customers?page=1&limit=50&search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Safe check for where your service places the array inside result
        setCustomers(data.customers || data.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Triggers API hit whenever the search string changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300); // 300ms debounce to prevent hammering the SQL database on every keystroke

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Handle customer deletion straight to the backend
  const handleDeleteCustomer = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:4000/api/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the local UI list immediately after deletion
        fetchCustomers();
      } else {
        alert(data.message || "Failed to delete customer record");
      }
    } catch (error) {
      alert("Server communication failure during deletion process");
    }
  };

  return (
    <div className="customers-container">
      
      {/* Top Main Heading Control Row */}
      <div className="customers-header">
        <div className="header-left">
          <h2>Customers Registry</h2>
          <p>Manage, track, and monitor all registered customer structural profiles.</p>
        </div>

        <button
          className="create-btn"
          onClick={() => setView("Create Customer")}
        >
          + Create Customer
        </button>
      </div>

      {/* Database Filtering Control Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search profiles by Name or Phone Reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      {/* Main Customers Ledger Data Grid */}
      <div className="table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Full Legal Name</th>
              <th>Phone Number</th>
              <th>PAN Identity</th>
              <th>Active Loans</th>
              <th style={{ textAlign: "right" }}>Account Management Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-message">Querying live tracking records...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">
                  No registered tracking records located in the database matching this query.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                // Securely sync client loan references
                const customerLoansCount = dataLoans.filter(
                  (l) => l?.customer?.toLowerCase() === customer?.name?.toLowerCase()
                ).length;

                return (
                  <tr key={customer.id} className="customer-row">
                    <td className="mono-text">#{customer.id}</td>
                    <td className="font-semibold">{customer.name}</td>
                    <td>{customer.phone || "N/A"}</td>
                    <td className="mono-text">{customer.pan || "N/A"}</td>
                    <td>
                      <span className="loans-count-badge">
                        {customer.activeLoans !== undefined ? customer.activeLoans : customerLoansCount} Active
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="customer-actions-cell" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Show Details Dynamic View Trigger Button */}
                        <button
                          type="button"
                          className="action-show-btn"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setView("Customer Profile");
                          }}
                        >
                          👁️ Show Details
                        </button>

                        {/* Delete Profile Target Button */}
                        <button
                          type="button"
                          className="action-delete-btn"
                          onClick={() => {
                            if (window.confirm(`Are you certain you want to purge customer ledger files for: ${customer.name}? This action is irreversible.`)) {
                              handleDeleteCustomer(customer.id);
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Customers;