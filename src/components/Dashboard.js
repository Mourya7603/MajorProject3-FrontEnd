import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSignOutAlt,
  FaPlus,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaSync,
  FaUser,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated before loading data
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Use Promise.allSettled to handle partial failures gracefully
      const [tasksResult, projectsResult, teamsResult] =
        await Promise.allSettled([
          axios.get("https://backend3-project.vercel.app/tasks", { headers }),
          axios.get("https://backend3-project.vercel.app/projects", {
            headers,
          }),
          axios.get("https://backend3-project.vercel.app/teams", { headers }),
        ]);

      // Handle each response separately
      if (tasksResult.status === "fulfilled") {
        setTasks(tasksResult.value.data);
      } else {
        console.error("Failed to fetch tasks:", tasksResult.reason);
        setError((prev) => prev + " Failed to load tasks. ");
      }

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value.data);
      } else {
        console.error("Failed to fetch projects:", projectsResult.reason);
        setError((prev) => prev + " Failed to load projects. ");
      }

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value.data);
      } else {
        console.error("Failed to fetch teams:", teamsResult.reason);
        // Teams might not be critical, so we don't set error for this
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      if (error.response?.status === 403 || error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        handleCleanLogout();
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Use replace instead of push to avoid adding to history
    navigate("/login", { replace: true });
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      handleCleanLogout();
    } catch (error) {
      console.error("Error during logout:", error);
      // Force logout even if there's an error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRetry = () => {
    setError("");
    fetchDashboardData();
  };

  // Filter tasks for the logged-in user only
  const getUserTasks = () => {
    if (!user) return [];
    return tasks.filter(
      (task) =>
        task.owners &&
        task.owners.some((owner) => owner._id === user.id || owner === user.id)
    );
  };

  // Filter tasks based on status and search term
  const filteredTasks = () => {
    let userTasks = getUserTasks();

    if (taskFilter !== "all") {
      userTasks = userTasks.filter((task) => task.status === taskFilter);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      userTasks = userTasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          (task.project &&
            task.project.name &&
            task.project.name.toLowerCase().includes(searchLower)) ||
          (task.tags &&
            task.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    return userTasks;
  };

  // Filter projects based on status and search term
  const filteredProjects = () => {
    let filtered = projects;

    // Filter by project status (using task status for demonstration)
    if (projectFilter !== "all") {
      // For demonstration, we'll check if any task in the project matches the status
      filtered = filtered.filter((project) => {
        const projectTasks = tasks.filter(
          (task) => task.project && task.project._id === project._id
        );
        return projectTasks.some((task) => task.status === projectFilter);
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          (project.description &&
            project.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  // Count tasks by status for a project
  const getProjectTaskCounts = (projectId) => {
    const projectTasks = tasks.filter(
      (task) => task.project && task.project._id === projectId
    );

    return {
      total: projectTasks.length,
      todo: projectTasks.filter((task) => task.status === "To Do").length,
      inProgress: projectTasks.filter((task) => task.status === "In Progress")
        .length,
      completed: projectTasks.filter((task) => task.status === "Completed")
        .length,
    };
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Show loading state during logout
  if (isLoggingOut) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Logging out...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <div className="error-state">
            <FaExclamationTriangle className="error-icon" />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-btn">
                <FaSync /> Try Again
              </button>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <div className="header-right">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search tasks or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="user-info">
              <span className="welcome-text">
                <FaUser className="user-icon" /> Welcome, {user?.name}
              </span>
              <button 
                onClick={handleLogout} 
                className="logout-btn"
                disabled={isLoggingOut}
              >
                <FaSignOutAlt /> {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="projects-section">
          <div className="section-header">
            <h2>All Projects</h2>
            <div className="filters-container">
              <span>Project Status: </span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Projects</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                className="add-btn"
                onClick={() => navigateTo("/projects/new")}
              >
                <FaPlus /> Add Project
              </button>
            </div>
          </div>
          <div className="projects-list">
            {filteredProjects().map((project) => {
              return (
                <div key={project._id} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description || "No description"}</p>
                  <button
                    className="view-btn"
                    onClick={() => navigateTo(`/projects/${project._id}`)}
                  >
                    <FaEye /> View Project
                  </button>
                </div>
              );
            })}
            {filteredProjects().length === 0 && (
              <div className="empty-state">
                <p>
                  {searchTerm || projectFilter !== "all"
                    ? "No projects match your filters"
                    : "No projects found. Create your first project!"}
                </p>
                <button
                  className="add-btn"
                  onClick={() => navigateTo("/projects/new")}
                >
                  <FaPlus /> Add Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <div className="filters-container">
              <span>Task Status: </span>
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Tasks</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
              <button
                className="add-btn"
                onClick={() => navigateTo("/tasks/new")}
              >
                <FaPlus /> Add Task
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {filteredTasks().length > 0 ? (
              filteredTasks().map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <h4>{task.name}</h4>
                    <div className="task-details">
                      <span className="project">
                        Project:{" "}
                        {task.project ? task.project.name : "No project"}
                      </span>
                      <span className="due-date">
                        Due:{" "}
                        {new Date(
                          task.dueDate || task.createdAt
                        ).toLocaleDateString()}
                      </span>
                      <span className="owner">
                        Owner:{" "}
                        {task.owners && task.owners.length > 0
                          ? typeof task.owners[0] === "object"
                            ? task.owners[0].name
                            : "Assigned"
                          : "Unassigned"}
                      </span>
                      <span
                        className={`status ${task.status
                          .replace(" ", "-")
                          .toLowerCase()}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className="view-btn"
                    onClick={() => navigateTo(`/tasks/${task._id}`)}
                  >
                    <FaEye /> View
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  {searchTerm || taskFilter !== "all"
                    ? "No tasks match your filters"
                    : "No tasks found. Create your first task!"}
                </p>
                <button
                  className="add-btn"
                  onClick={() => navigateTo("/tasks/new")}
                >
                  <FaPlus /> Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
