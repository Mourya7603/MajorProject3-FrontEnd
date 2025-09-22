import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaBell,
  FaPalette,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "./Sidebar";
import "./Settings.css";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: "https://backend3-project.vercel.app",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, setIsDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    theme: isDarkMode ? "dark" : "light",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  // Update preferences when theme changes
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: isDarkMode ? "dark" : "light"
    }));
  }, [isDarkMode]);

  const handlePreferenceChange = (field, value) => {
    if (field === 'theme') {
      // Handle theme change
      setIsDarkMode(value === 'dark');
    }
    
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
    loadPreferences();
  }, [user]);

  const loadPreferences = () => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  };

  const savePreferences = () => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    setSuccess("Preferences saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update profile information
      const updateData = {};
      if (profileData.name !== user.name) updateData.name = profileData.name;
      if (profileData.email !== user.email) updateData.email = profileData.email;

      if (Object.keys(updateData).length > 0) {
        const response = await api.put("/auth/me", updateData);
        const updatedUser = response.data;
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setSuccess("Profile updated successfully!");
      }

      // Change password if provided
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setError("New passwords do not match");
          setIsLoading(false);
          return;
        }

        if (profileData.newPassword.length < 6) {
          setError("New password must be at least 6 characters long");
          setIsLoading(false);
          return;
        }

        await api.put("/auth/change-password", {
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        });

        setSuccess("Password changed successfully!");
        
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.error || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get("/user/data-export");
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileDefaultName = `workasana-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccess("Data exported successfully!");
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!window.confirm("This will permanently delete all your data. Please type 'DELETE' to confirm.")) {
      return;
    }

    try {
      await api.delete("/auth/account");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="settings-container">
      <Sidebar />

      <div className="main-content">
        <div className="settings-header">
          <button onClick={handleBackToDashboard} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Settings</h1>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <FaCheckCircle /> {success}
          </div>
        )}

        <div className="settings-tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /> Profile
          </button>
          <button
            className={activeTab === "preferences" ? "active" : ""}
            onClick={() => setActiveTab("preferences")}
          >
            <FaBell /> Preferences
          </button>
          <button
            className={activeTab === "appearance" ? "active" : ""}
            onClick={() => setActiveTab("appearance")}
          >
            <FaPalette /> Appearance
          </button>
          <button
            className={activeTab === "security" ? "active" : ""}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Security
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <FaUser /> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="preferences-grid">
                <div className="preference-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Email Notifications
                  </label>
                  <p className="preference-description">Receive email updates about your tasks and projects</p>
                </div>

                <div className="preference-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.desktopNotifications}
                      onChange={(e) => handlePreferenceChange("desktopNotifications", e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Desktop Notifications
                  </label>
                  <p className="preference-description">Show browser notifications for important updates</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="form-actions">
                <button onClick={savePreferences} className="save-button">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              
              <div className="form-group">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  value={preferences.theme}
                  onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
               <div className="theme-preview">
                <h4>Theme Preview</h4>
                <p>See how your app will look with the selected theme</p>
                
                <div className={`preview-box ${isDarkMode ? 'dark' : 'light'}`}>
                  <div className="preview-content">
                    <div className="preview-card">
                      <h5>Project Card</h5>
                      <p>This is a sample project card with some content</p>
                      <button className="preview-button">View Project</button>
                    </div>
                    
                    <div className="preview-card">
                      <h5>Task Item</h5>
                      <p>Sample task description goes here</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          background: isDarkMode ? '#334155' : '#e2e8f0',
                          color: isDarkMode ? '#e2e8f0' : '#334155'
                        }}>
                          In Progress
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          background: isDarkMode ? '#065f46' : '#d1fae5',
                          color: isDarkMode ? '#d1fae5' : '#065f46'
                        }}>
                          High Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="theme-toggle-preview">
                    <span>Theme:</span>
                    <button 
                      className={!isDarkMode ? 'active' : ''}
                      onClick={() => setIsDarkMode(false)}
                    >
                      <FaSun /> Light
                    </button>
                    <button 
                      className={isDarkMode ? 'active' : ''}
                      onClick={() => setIsDarkMode(true)}
                    >
                      <FaMoon /> Dark
                    </button>
                  </div>
                </div>
              </div>

        

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange("language", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div className="form-actions">
                <button onClick={savePreferences} className="save-button">
                  Save Appearance Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="security-section">
                <h3>Change Password</h3>
                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={profileData.currentPassword}
                      onChange={(e) => handleProfileChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={profileData.newPassword}
                      onChange={(e) => handleProfileChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={(e) => handleProfileChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={isLoading}>
                      {isLoading ? "Changing Password..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="security-section">
                <h3>Data Management</h3>
                <div className="security-actions">
                  <button onClick={handleExportData} className="export-button">
                    Export My Data
                  </button>
                  <button onClick={handleDeleteAccount} className="delete-account-button">
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;