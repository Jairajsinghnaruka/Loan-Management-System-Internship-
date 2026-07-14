import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
  });

  const [notifications, setNotifications] = useState({
    email: false,
    updates: false,
    alerts: false,
  });

  const [theme, setTheme] = useState("Light Mode");

  const saveProfile = () => {
    alert("Profile Updated Successfully");
  };

  const updatePassword = () => {
    alert("Password Updated Successfully");
  };

  const saveNotifications = () => {
    alert("Notification Preferences Saved");
  };

  const applyTheme = () => {
    alert(`${theme} Applied`);
  };

  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>

      <div className="settings-grid">

        {/* Profile */}

        <div className="settings-card">
          <h3>👤 Profile Settings</h3>

          <input
            type="text"
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) =>
              setProfile({
                ...profile,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            value={profile.email}
            onChange={(e) =>
              setProfile({
                ...profile,
                email: e.target.value,
              })
            }
          />

          <button onClick={saveProfile}>
            Save Changes
          </button>
        </div>

        {/* Security */}

        <div className="settings-card">
          <h3>🔒 Security</h3>

          <input
            type="password"
            placeholder="Current Password"
            value={password.current}
            onChange={(e) =>
              setPassword({
                ...password,
                current: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            value={password.newPassword}
            onChange={(e) =>
              setPassword({
                ...password,
                newPassword: e.target.value,
              })
            }
          />

          <button onClick={updatePassword}>
            Update Password
          </button>
        </div>

        {/* Notifications */}

        <div className="settings-card">
          <h3>🔔 Notifications</h3>

          <label>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  email: e.target.checked,
                })
              }
            />
            Email Notifications
          </label>

          <label>
            <input
              type="checkbox"
              checked={notifications.updates}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  updates: e.target.checked,
                })
              }
            />
            Project Updates
          </label>

          <label>
            <input
              type="checkbox"
              checked={notifications.alerts}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  alerts: e.target.checked,
                })
              }
            />
            Team Alerts
          </label>

          <button onClick={saveNotifications}>
            Save Preferences
          </button>
        </div>

        {/* Appearance */}

        <div className="settings-card">
          <h3>🎨 Appearance</h3>

          <select
            value={theme}
            onChange={(e) =>
              setTheme(e.target.value)
            }
          >
            <option>Light Mode</option>
            <option>Dark Mode</option>
          </select>

          <button onClick={applyTheme}>
            Apply Theme
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;