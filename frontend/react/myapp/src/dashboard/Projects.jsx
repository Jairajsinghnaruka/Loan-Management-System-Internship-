import { useState } from "react";
import "./Projects.css";

function Projects({
  projects,
  setProjects,
  deleteProject,
}) {
  const [search, setSearch] = useState("");

  const [newProject, setNewProject] = useState({
    name: "",
    manager: "",
    status: "Planning",
    progress: "",
    team: "",
  });

  const handleCreateProject = () => {
    if (
      !newProject.name ||
      !newProject.manager ||
      !newProject.progress ||
      !newProject.team
    ) {
      alert("Please fill all fields");
      return;
    }

    setProjects([
      ...projects,
      {
        id: Date.now(),
        name: newProject.name,
        manager: newProject.manager,
        status: newProject.status,
        progress: Number(newProject.progress),
        team: Number(newProject.team),
      },
    ]);

    setNewProject({
      name: "",
      manager: "",
      status: "Planning",
      progress: "",
      team: "",
    });
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
      </div>

      {/* Create Project Form */}
      <div className="project-form">
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) =>
            setNewProject({
              ...newProject,
              name: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Manager Name"
          value={newProject.manager}
          onChange={(e) =>
            setNewProject({
              ...newProject,
              manager: e.target.value,
            })
          }
        />

        <select
          value={newProject.status}
          onChange={(e) =>
            setNewProject({
              ...newProject,
              status: e.target.value,
            })
          }
        >
          <option>Planning</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <input
          type="number"
          placeholder="Progress %"
          value={newProject.progress}
          onChange={(e) =>
            setNewProject({
              ...newProject,
              progress: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Team Size"
          value={newProject.team}
          onChange={(e) =>
            setNewProject({
              ...newProject,
              team: e.target.value,
            })
          }
        />

        <button
          className="create-btn"
          onClick={handleCreateProject}
        >
          Create Project
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>{projects.length}</p>
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <p>
            {
              projects.filter(
                (project) =>
                  project.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>
            {
              projects.filter(
                (project) =>
                  project.status === "Completed"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Planning</h3>
          <p>
            {
              projects.filter(
                (project) =>
                  project.status === "Planning"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search Project..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Projects Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Team</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects
              .filter((project) =>
                project.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>

                  <td>
                    {project.manager || "N/A"}
                  </td>

                  <td>{project.status}</td>

                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      ></div>
                    </div>

                    {project.progress}%
                  </td>

                  <td>
                    {project.team || "-"}
                  </td>

                  <td>
                    <button className="view-btn">
                      View
                    </button>

                    <button className="edit-btn">
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteProject(project.id)
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

export default Projects;