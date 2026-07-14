import { useState } from "react";
import "./Reports.css";

function Reports() {
  const [reportName, setReportName] = useState("");
  const [reportDate, setReportDate] = useState("");

  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Project Performance Report",
      date: "2026-06-10",
      status: "Completed",
    },
    {
      id: 2,
      name: "Employee Activity Report",
      date: "2026-06-08",
      status: "Completed",
    },
    {
      id: 3,
      name: "Task Progress Report",
      date: "2026-06-05",
      status: "Completed",
    },
  ]);

  const addReport = () => {
    if (!reportName || !reportDate) return;

    const newReport = {
      id: Date.now(),
      name: reportName,
      date: reportDate,
      status: "Completed",
    };

    setReports([...reports, newReport]);

    setReportName("");
    setReportDate("");
  };

  const deleteReport = (id) => {
    setReports(
      reports.filter((report) => report.id !== id)
    );
  };

  return (
    <div className="reports-page">
      <h1>📈 Reports</h1>

      {/* Report Creation */}

      <div className="report-form">
        <input
          type="text"
          placeholder="Report Name"
          value={reportName}
          onChange={(e) =>
            setReportName(e.target.value)
          }
        />

        <input
          type="date"
          value={reportDate}
          onChange={(e) =>
            setReportDate(e.target.value)
          }
        />

        <button onClick={addReport}>
          Create Report
        </button>
      </div>

      {/* Statistics */}

      <div className="reports-cards">
        <div className="report-card">
          <h3>Total Reports</h3>
          <p>{reports.length}</p>
        </div>

        <div className="report-card">
          <h3>Completed Reports</h3>
          <p>{reports.length}</p>
        </div>

        <div className="report-card">
          <h3>Pending Tasks</h3>
          <p>42</p>
        </div>

        <div className="report-card">
          <h3>Team Members</h3>
          <p>18</p>
        </div>
      </div>

      {/* Reports Table */}

      <div className="report-section">
        <h2>Recent Reports</h2>

        <table>
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.date}</td>
                <td>{report.status}</td>

                <td>
                  <button className="download-btn">
                    Download
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteReport(report.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;