import { useState } from "react";
import "./Notifications.css";

function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Project Assigned",
      message:
        "You have been assigned to CRM Dashboard project.",
      time: "5 mins ago",
    },
    {
      id: 2,
      title: "Task Completed",
      message:
        "HR Portal documentation task was completed.",
      time: "1 hour ago",
    },
  ]);

  const addNotification = () => {
    if (!title || !message) return;

    const newNotification = {
      id: Date.now(),
      title,
      message,
      time: "Just Now",
    };

    setNotifications([
      newNotification,
      ...notifications,
    ]);

    setTitle("");
    setMessage("");
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="notifications-page">
      <div className="notification-header">
        <h1>🔔 Notifications</h1>
      </div>

      {/* Create Notification */}

      <div className="notification-form">
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <textarea
          placeholder="Notification Message"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />

        <button onClick={addNotification}>
          Add Notification
        </button>
      </div>

      {/* Stats */}

      <div className="notification-stats">
        <div className="stat-card">
          <h3>Total Notifications</h3>
          <p>{notifications.length}</p>
        </div>

        <div className="stat-card">
          <h3>Unread</h3>
          <p>{notifications.length}</p>
        </div>
      </div>

      {/* Notifications List */}

      <div className="notifications-container">
        {notifications.map((item) => (
          <div
            className="notification-card"
            key={item.id}
          >
            <h3>{item.title}</h3>

            <p>{item.message}</p>

            <span>{item.time}</span>

            <div className="notification-actions">
              <button
                className="delete-btn"
                onClick={() =>
                  deleteNotification(item.id)
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

export default Notifications;