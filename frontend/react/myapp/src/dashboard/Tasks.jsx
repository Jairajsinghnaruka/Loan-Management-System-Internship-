import { useState } from "react";
import "./Tasks.css";

function Tasks() {
  const [search, setSearch] = useState("");

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Create Login Page",
      project: "Loan Management System",
      assignedTo: "John",
      priority: "High",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Design Dashboard",
      project: "CRM Dashboard",
      assignedTo: "Sarah",
      priority: "Medium",
      status: "Pending",
    },
    {
      id: 3,
      title: "Database Setup",
      project: "HR Portal",
      assignedTo: "Mike",
      priority: "High",
      status: "Completed",
    },
  ]);

  const addTask = () => {
    const title = prompt("Enter Task Name");

    if (!title) return;

    const project =
      prompt("Enter Project Name") || "General";

    const assignedTo =
      prompt("Assign To") || "Unassigned";

    const priority =
      prompt("Priority (High/Medium/Low)") ||
      "Medium";

    const newTask = {
      id: Date.now(),
      title,
      project,
      assignedTo,
      priority,
      status: "Pending",
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id) => {
    setTasks(
      tasks.filter((task) => task.id !== id)
    );
  };

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const progressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Tasks</h1>

        <button
          className="add-task-btn"
          onClick={addTask}
        >
          + Create Task
        </button>
      </div>

      <div className="task-stats">
        <div className="task-card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="task-card">
          <h3>Pending</h3>
          <p>{pendingCount}</p>
        </div>

        <div className="task-card">
          <h3>In Progress</h3>
          <p>{progressCount}</p>
        </div>

        <div className="task-card">
          <h3>Completed</h3>
          <p>{completedCount}</p>
        </div>
      </div>

      <div className="task-filters">
        <input
          type="text"
          placeholder="Search Tasks..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className="task-table">
        <div className="table-header">
          <div>Task</div>
          <div>Project</div>
          <div>Assigned To</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {tasks
          .filter((task) =>
            task.title
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((task) => (
            <div
              className="table-row"
              key={task.id}
            >
              <div>{task.title}</div>
              <div>{task.project}</div>
              <div>{task.assignedTo}</div>
              <div>{task.priority}</div>
              <div>{task.status}</div>

              <div className="actions">
                <button className="view-btn">
                  View
                </button>

                <button className="edit-btn">
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteTask(task.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Tasks;