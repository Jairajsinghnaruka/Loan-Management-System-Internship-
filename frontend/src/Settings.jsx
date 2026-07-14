import React, { useState, useEffect } from 'react';
import "./Settings.css";

function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: "",
    phone: ""
  });

  const [permissions, setPermissions] = useState({
    allowManagersToApprove: true,
    showOverdueAlertsToAll: false,
    restrictExportToAdmin: true
  });

  const [theme, setTheme] = useState("Glassmorphic Dark");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [alertMessage, setAlertMessage] = useState({ text: "", type: "" });
  const API_BASE_URL = "http://localhost:4000/api";

  const themeTemplates = [
    { 
      name: "Glassmorphic Dark", 
      desc: "Translucent panels over a deep cosmic canvas.", 
      colors: ["#0b1120", "#22d3ee"],
      vars: { 
        "--bg-main": "#0b1120", 
        "--accent-color": "#22d3ee", 
        "--card-bg": "rgba(255, 255, 255, 0.03)", 
        "--card-border": "rgba(255, 255, 255, 0.06)",
        "--text-muted": "#64748b",
        "--input-focus": "#22d3ee"
      } 
    },
    { 
      name: "Nordic Midnight", 
      desc: "Muted blue and slate highlights for optimal contrast.", 
      colors: ["#0f172a", "#38bdf8"],
      vars: { 
        "--bg-main": "#0f172a", 
        "--accent-color": "#38bdf8", 
        "--card-bg": "#1e293b", 
        "--card-border": "rgba(56, 189, 248, 0.2)",
        "--text-muted": "#94a3b8",
        "--input-focus": "#38bdf8"
      } 
    },
    { 
      name: "Pure Cyber Black", 
      desc: "True pitch-black pixels designed for low eye fatigue.", 
      colors: ["#000000", "#10b981"],
      vars: { 
        "--bg-main": "#000000", 
        "--accent-color": "#10b981", 
        "--card-bg": "#0a0a0a", 
        "--card-border": "rgba(16, 185, 129, 0.25)",
        "--text-muted": "#737373",
        "--input-focus": "#10b981"
      } 
    }
  ];

  useEffect(() => {
    fetchUserSettings();
    const activeTheme = localStorage.getItem("workspace-theme") || "Glassmorphic Dark";
    setTheme(activeTheme);
  }, []);

  const applyThemeVariables = (themeName) => {
    const target = themeTemplates.find(t => t.name === themeName);
    if (target && target.vars) {
      Object.entries(target.vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/settings`, { headers });
      const data = await res.json();
      
      if (data.success && data.settings) {
        const { settings } = data;
        setProfile({
          fullName: settings.name || "",
          email: settings.email || "",
          role: settings.role || "USER",
          phone: settings.phone || ""
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: profile.fullName,
          email: profile.email
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerBanner("Profile details synced with database successfully!", "success");
      }
    } catch (error) {
      triggerBanner("Could not sync profile details.", "error");
    }
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    triggerBanner("System authorization variables synchronized.", "success");
  };

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    localStorage.setItem("workspace-theme", themeName);
    applyThemeVariables(themeName);
    triggerBanner(`Workspace design layout updated to ${themeName}!`, "success");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerBanner("New passwords do not match. Integrity confirmation failed.", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      triggerBanner("Security criteria failure: Password must be at least 6 characters.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/settings/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerBanner("Password changed successfully!", "success");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        triggerBanner(data.message || "Failed to update password.", "error");
      }
    } catch (error) {
      triggerBanner("Error processing password change request.", "error");
    }
  };

  const triggerBanner = (text, type) => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage({ text: "", type: "" }), 4000);
  };

  return (
    <div className="settings-wrapper-view">
      {alertMessage.text && (
        <div className={`settings-global-alert alert-${alertMessage.type}`}>
          {alertMessage.type === 'success' ? '✓' : '✕'} {alertMessage.text}
        </div>
      )}

      <div className="settings-header-section">
        <h2>System Parameters Control Panel</h2>
        <p>Configure user identities, access visibility matrices, dark mode interfaces, and credential keys.</p>
      </div>

      <div className="settings-grid-layout">
        <div className="settings-vertical-stack">
          <div className="settings-glass-card">
            <h3 className="settings-card-title">👤 User Identity Details</h3>
            <form onSubmit={handleProfileSave} className="settings-inner-form">
              <div className="form-row-2x">
                <div>
                  <label className="settings-input-label">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={profile.fullName} 
                    onChange={e => setProfile({...profile, fullName: e.target.value})} 
                    className="settings-text-input" 
                  />
                </div>
                <div>
                  <label className="settings-input-label">System Security Role</label>
                  <input type="text" disabled value={profile.role} className="settings-text-input disabled" />
                </div>
              </div>
              <div>
                <label className="settings-input-label">Authorized Corporate Email</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  className="settings-text-input" 
                />
              </div>
              <div>
                <label className="settings-input-label">Contact Phone Number</label>
                <input type="text" disabled value={profile.phone} className="settings-text-input disabled" />
              </div>
              <button type="submit" className="settings-action-btn primary-gradient">
                Commit Identity Changes
              </button>
            </form>
          </div>

          <div className="settings-glass-card">
            <h3 className="settings-card-title">🔑 Change Security Passcode</h3>
            <form onSubmit={handlePasswordChange} className="settings-inner-form">
              <div>
                <label className="settings-input-label">Current Authentication Key</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="settings-text-input" 
                />
              </div>
              <div className="form-row-2x">
                <div>
                  <label className="settings-input-label">New Passcode Segment</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="settings-text-input" 
                  />
                </div>
                <div>
                  <label className="settings-input-label">Confirm New Passcode</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Retype password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="settings-text-input" 
                  />
                </div>
              </div>
              <button type="submit" className="settings-action-btn secondary-cyan">
                Rewrite Secure Credentials
              </button>
            </form>
          </div>
        </div>

        <div className="settings-vertical-stack">
          <div className="settings-glass-card">
            <h3 className="settings-card-title">🎨 Visual Core Theme</h3>
            <p className="settings-card-desc">Select your preferred user interface configuration. Changes apply instantly across all navigation menus.</p>
            <div className="theme-options-grid">
              {themeTemplates.map(t => (
                <div 
                  key={t.name} 
                  className={`theme-selection-node ${theme === t.name ? 'active-theme' : ''}`}
                  onClick={() => handleThemeChange(t.name)}
                >
                  <div className="theme-node-meta">
                    <span className="theme-node-title">{t.name}</span>
                    <span className="theme-node-desc">{t.desc}</span>
                  </div>
                  <div className="theme-preview-dots">
                    <span style={{ backgroundColor: t.colors[0] }} />
                    <span style={{ backgroundColor: t.colors[1] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-glass-card">
            <h3 className="settings-card-title">🛡️ Database Visibility Permissions</h3>
            <p className="settings-card-desc">Govern visibility flags and determine who can view loan summaries or extract data metrics records.</p>
            <div className="permissions-toggle-stack">
              <div className="toggle-control-item">
                <div className="toggle-meta-data">
                  <span className="toggle-main-text">Manager Approval Delegation</span>
                  <span className="toggle-sub-text">Allows accounts managers to change loan states from Pending to Active.</span>
                </div>
                <label className="native-switch-container">
                  <input 
                    type="checkbox" 
                    checked={permissions.allowManagersToApprove}
                    onChange={() => togglePermission('allowManagersToApprove')}
                  />
                  <span className="native-switch-slider" />
                </label>
              </div>

              <div className="toggle-control-item">
                <div className="toggle-meta-data">
                  <span className="toggle-main-text">Broadcast Overdue Default Alerts</span>
                  <span className="toggle-sub-text">Displays red warning pop-ups on the general dashboard to all login layers.</span>
                </div>
                <label className="native-switch-container">
                  <input 
                    type="checkbox" 
                    checked={permissions.showOverdueAlertsToAll}
                    onChange={() => togglePermission('showOverdueAlertsToAll')}
                  />
                  <span className="native-switch-slider" />
                </label>
              </div>

              <div className="toggle-control-item">
                <div className="toggle-meta-data">
                  <span className="toggle-main-text">Restrict Spreadsheet Extracts</span>
                  <span className="toggle-sub-text">Locks down CSV data downloads to the primary administrator login profile only.</span>
                </div>
                <label className="native-switch-container">
                  <input 
                    type="checkbox" 
                    checked={permissions.restrictExportToAdmin}
                    onChange={() => togglePermission('restrictExportToAdmin')}
                  />
                  <span className="native-switch-slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;