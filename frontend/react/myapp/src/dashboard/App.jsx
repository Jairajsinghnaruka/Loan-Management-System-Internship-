import { useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Login from "./loginpage/login";
import Projects from "./Projects";
import Tasks from "./Tasks";
import Teams from "./Teams";
import Calendar from "./Calendar";
import Settings from "./Settings";
import Notifications from "./Notifications";
import Reports from "./Reports";
import "./App.css";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Loan Management System",
      status: "In Progress",
      progress: "20%",
    },
    {
      id: 2,
      name: "HR Portal",
      status: "Completed",
      progress: "100%",
    },
    {
      id: 3,
      name: "CRM Dashboard",
      status: "Planning",
      progress: "0%",
    },
    {
      id: 4,
      name: "Inventory Management System",
      status: "In Progress",
      progress: "40%",
    },
  ]);

  const projectRef = useRef(null);

  const scrollLeft = () => {
    projectRef.current.scrollBy({
      left: -320,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    projectRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  const addProject = () => {
    const projectName = prompt("Enter Project Name");

    if (!projectName) return;

    const newProject = {
      id: Date.now(),
      name: projectName,
      status: "Planning",
      progress: "0%",
    };

    setProjects([...projects, newProject]);
  };

  const deleteProject = (id) => {
    setProjects(
      projects.filter((project) => project.id !== id)
    );
  };

  if (!userRole) {
    return <Login setUserRole={setUserRole} />;
  }

  return (
    <div className="container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {sidebarOpen && (
          <>
            <div className="sidebar-header">
              <button
                className="toggle-btn"
                onClick={() => setSidebarOpen(false)}
              >
                ☰
              </button>

              <h2>DashCorp</h2>
            </div>

            <ul>
              <li onClick={() => setCurrentPage("dashboard")}>
                📊 Dashboard
              </li>

              <li onClick={() => setCurrentPage("projects")}>
                📁 Projects
              </li>

              <li onClick={() => setCurrentPage("tasks")}>
                ✅ Tasks
              </li>

              <li onClick={() => setCurrentPage("teams")}>
                👥 Teams
              </li>

              <li onClick={() => setCurrentPage("calendar")}>
                📅 Calendar
              </li>

              <li onClick={() => setCurrentPage("reports")}>
                📈 Reports
              </li>

              <li onClick={() => setCurrentPage("notifications")}>
                🔔 Notifications
              </li>

              <li onClick={() => setCurrentPage("settings")}>
                ⚙️ Settings
              </li>
            </ul>

            <button
              className="logout-btn"
              onClick={() => setUserRole(null)}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Main */}
      <div className="main">
        {!sidebarOpen && (
          <button
            className="header-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        {currentPage === "dashboard" && (
          <>
            {/* Header */}
            <div className="header">
              <h1>{userRole} Dashboard</h1>

              <div className="header-right">
                <div className="search-box">
                  <FaSearch className="search-icon" />

                  <input
                    type="text"
                    placeholder="Search Projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button className="search-btn">
                  Search
                </button>

                <button
                  className="create-btn"
                  onClick={addProject}
                >
                  Create Project
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="cards-grid">
              <div className="card">
                <h3>Total Projects</h3>
                <p>{projects.length}</p>
              </div>

              <div className="card">
                <h3>Active Tasks</h3>
                <p>12</p>
              </div>

              <div className="card">
                <h3>Employees</h3>
                <p>25</p>
              </div>

              <div className="card">
                <h3>Pending Approvals</h3>
                <p>3</p>
              </div>
            </div>

            {/* Projects */}
            <div className="projects-header">
              <h2 className="section-title">Projects</h2>

              <div>
                <button
                  className="slide-btn"
                  onClick={scrollLeft}
                >
                  ◀
                </button>

                <button
                  className="slide-btn"
                  onClick={scrollRight}
                >
                  ▶
                </button>
              </div>
            </div>

            <div
              className="project-grid"
              ref={projectRef}
            >
              {projects
                .filter((project) =>
                  project.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((project) => (
                  <div
                    className="project-card"
                    key={project.id}
                  >
                    <h3>{project.name}</h3>

                    <p>
                      Status: {project.status}
                    </p>

                    <p>
                      Progress: {project.progress}
                    </p>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteProject(project.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>

            {/* Team */}
            <h2 className="section-title">
              Team Members
            </h2>

            <div className="team">
              <div className="member">John Doe</div>
              <div className="member">Sarah Smith</div>
              <div className="member">Alex Johnson</div>
              <div className="member">Emily Davis</div>
            </div>
          </>
        )}

      {currentPage === "projects" && (
  <Projects
    projects={projects}
    setProjects={setProjects}
  />
)}
        {currentPage === "tasks" && <Tasks />}
        {currentPage === "teams" && <Teams />}
        {currentPage === "calendar" && <Calendar />}
        {currentPage === "settings" && <Settings />}
        {currentPage === "notifications" && <Notifications />}
        {currentPage === "reports" && <Reports />}
      </div>
    </div>
  );
}

export default App;