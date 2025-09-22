import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUser,
  FaTag,
  FaCalendar,
  FaClock,
  FaUsers,
  FaFolder,
  FaCheckCircle,
} from "react-icons/fa";
import "./AddTask.css";

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

const AddTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    project: "",
    owners: [],
    tags: [],
    timeToComplete: "1",
    status: "To Do", // Default status
  });

  // Options state
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [projects, setProjects] = useState([]);

  // Get project ID from URL params or query string
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project");

  // Check if we're editing an existing task
  const isEditMode = location.state?.task;

  useEffect(() => {
    fetchOptionsData();
    
    // If we're editing an existing task, pre-fill the form
    if (isEditMode) {
      const task = location.state.task;
      setFormData({
        name: task.name || "",
        team: task.team?._id || task.team || "",
        project: task.project?._id || task.project || "",
        owners: task.owners ? task.owners.map(owner => owner._id || owner) : [],
        tags: task.tags || [],
        timeToComplete: task.timeToComplete?.toString() || "1",
        status: task.status || "To Do",
      });
    }
  }, [isEditMode, location.state]);

  const fetchOptionsData = async () => {
    try {
      // Fetch teams
      const teamsResponse = await api.get("/teams");
      setTeams(teamsResponse.data);

      // Fetch projects
      const projectsResponse = await api.get("/projects");
      setProjects(projectsResponse.data);

      // If projectId is provided in URL, set it in form data
      if (projectId && !isEditMode) {
        setFormData(prev => ({ ...prev, project: projectId }));
      }

      // Fetch users
      try {
        const currentUserResponse = await api.get("/auth/me");
        const currentUser = currentUserResponse.data;
        
        // Try to get additional users from teams or other endpoints
        try {
          // Get users from teams (if your API supports this)
          const teamsWithUsers = await api.get("/teams?populate=members");
          const allUsers = new Set();
          
          // Add current user
          allUsers.add(currentUser);
          
          // Add users from teams
          teamsWithUsers.data.forEach(team => {
            if (team.members) {
              team.members.forEach(member => {
                if (member._id) allUsers.add(member);
              });
            }
          });
          
          setUsers(Array.from(allUsers));
        } catch {
          // Fallback: just use current user
          setUsers([currentUser]);
        }
      } catch (userError) {
        console.error("Error fetching users:", userError);
        setUsers([]);
      }

      // Fetch tags
      try {
        const tagsResponse = await api.get("/tags");
        setAvailableTags(tagsResponse.data);
      } catch (tagsError) {
        console.error("Error fetching tags:", tagsError);
        setAvailableTags([
          "Urgent",
          "Bug",
          "Feature",
          "UI",
          "Backend",
          "Frontend",
        ]);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      setError("Failed to load form options");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Task name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.team) {
      setError("Please select a team");
      setIsLoading(false);
      return;
    }

    if (!formData.project) {
      setError("Please select a project");
      setIsLoading(false);
      return;
    }

    if (formData.owners.length === 0) {
      setError("Please select at least one owner");
      setIsLoading(false);
      return;
    }

    try {
      const taskData = {
        name: formData.name.trim(),
        team: formData.team,
        project: formData.project,
        owners: formData.owners,
        tags: formData.tags,
        timeToComplete: parseInt(formData.timeToComplete) || 1,
        status: formData.status,
      };

      let response;
      if (isEditMode) {
        // Update existing task
        response = await api.put(`/tasks/${location.state.task._id}`, taskData);
      } else {
        // Create new task
        response = await api.post("/tasks", taskData);
      }

      setSuccess(isEditMode ? "Task updated successfully!" : "Task created successfully!");

      // Redirect after success
      setTimeout(() => {
        navigate(`/projects/${formData.project}`);
      }, 1500);
    } catch (error) {
      console.error("Error saving task:", error);
      setError(
        error.response?.data?.error ||
          `Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (formData.project) {
      navigate(`/projects/${formData.project}`);
    } else {
      navigate("/dashboard");
    }
  };

  const toggleCompletion = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === "Completed" ? "To Do" : "Completed"
    }));
  };

  return (
    <div className="add-task-container">
      <div className="add-task-header">
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <h1>{isEditMode ? "Edit Task" : "Create New Task"}</h1>
        
        {/* Quick Complete Toggle */}
        <button
          type="button"
          onClick={toggleCompletion}
          className={`complete-toggle ${formData.status === "Completed" ? "completed" : ""}`}
          disabled={isLoading}
        >
          <FaCheckCircle />
          {formData.status === "Completed" ? "Completed" : "Mark Complete"}
        </button>
      </div>

      <div className="add-task-content">
        <form onSubmit={handleSubmit} className="task-form">
          {error && (
            <div className="error-message">
              <FaTimes /> {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <FaSave /> {success}
            </div>
          )}

          {/* Status Indicator */}
          {formData.status === "Completed" && (
            <div className="status-banner completed">
              <FaCheckCircle /> This task is marked as completed
            </div>
          )}

          <div className="form-group">
            <label htmlFor="taskName">
              <FaTag /> Task Name *
            </label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter task name"
              className="form-input"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="project">
              <FaFolder /> Project *
            </label>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={(e) => handleInputChange("project", e.target.value)}
              className="form-select"
              disabled={isLoading || Boolean(projectId && !isEditMode)}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {projectId && !isEditMode && (
              <p className="help-text">Project is pre-selected from URL</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="team">
              <FaUsers /> Team *
            </label>
            <select
              id="team"
              name="team"
              value={formData.team}
              onChange={(e) => handleInputChange("team", e.target.value)}
              className="form-select"
              disabled={isLoading}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaUser /> Owners *
            </label>
            <div className="multi-select-container">
              {users.map((user) => {
                const userId = user._id || user.id;
                const userName = user.name || `User ${userId}`;
                const userEmail = user.email ? ` (${user.email})` : "";
                
                return (
                  <label key={userId} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="owners"
                      checked={formData.owners.includes(userId)}
                      onChange={() => handleMultiSelect("owners", userId)}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                    {userName}{userEmail}
                  </label>
                );
              })}
              {users.length === 0 && (
                <p className="no-options">No users available</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaTag /> Tags
            </label>
            <div className="multi-select-container">
              {availableTags.map((tag, index) => {
                const tagValue = typeof tag === 'object' ? tag.name || tag._id : tag;
                const tagName = typeof tag === 'object' ? tag.name || tag._id : tag;
                const tagKey = typeof tag === 'object' ? tag._id : `tag-${index}`;
                
                return (
                  <label key={tagKey} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="tags"
                      checked={formData.tags.includes(tagValue)}
                      onChange={() => handleMultiSelect("tags", tagValue)}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                    {tagName}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeToComplete">
              <FaClock /> Time to Complete (Days) *
            </label>
            <input
              type="number"
              id="timeToComplete"
              name="timeToComplete"
              value={formData.timeToComplete}
              onChange={(e) =>
                handleInputChange("timeToComplete", e.target.value)
              }
              placeholder="Estimated days"
              min="1"
              max="365"
              className="form-input"
              disabled={isLoading || formData.status === "Completed"}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              <FaCheckCircle /> Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="form-select"
              disabled={isLoading}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleBack}
              className="cancel-button"
              disabled={isLoading}
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <FaSave /> {isEditMode ? "Update Task" : "Create Task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;