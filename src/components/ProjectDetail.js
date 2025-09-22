import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaPlus,
  FaFilter,
  FaSort,
  FaUser,
  FaTag,
  FaCalendar,
  FaExclamationCircle,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./ProjectDetail.css";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  // Available filters
  const [availableOwners, setAvailableOwners] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, ownerFilter, tagFilter, sortBy]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch project details
      const projectResponse = await axios.get(
        `https://backend3-project.vercel.app/projects/${projectId}`,
        { headers }
      );
      setProject(projectResponse.data);

      // Fetch all tasks and filter by this project
      const tasksResponse = await axios.get(
        "https://backend3-project.vercel.app/tasks",
        { headers }
      );

      const projectTasks = tasksResponse.data.filter(
        (task) => task.project && task.project._id === projectId
      );

      setTasks(projectTasks);

      // Extract available filters
      extractFilters(projectTasks);
    } catch (err) {
      setError("Failed to load project data");
      console.error("Error fetching project data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractFilters = (tasks) => {
    // Extract unique owners
    const owners = new Set();
    const tags = new Set();

    tasks.forEach((task) => {
      if (task.owners && task.owners.length > 0) {
        task.owners.forEach((owner) => {
          if (typeof owner === "object") {
            owners.add(owner._id);
          } else {
            owners.add(owner);
          }
        });
      }

      if (task.tags && task.tags.length > 0) {
        task.tags.forEach((tag) => tags.add(tag));
      }
    });

    setAvailableOwners(Array.from(owners));
    setAvailableTags(Array.from(tags));
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply owner filter
    if (ownerFilter !== "all") {
      filtered = filtered.filter(
        (task) =>
          task.owners &&
          task.owners.some(
            (owner) =>
              (typeof owner === "object" ? owner._id : owner) === ownerFilter
          )
      );
    }

    // Apply tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.tags && task.tags.includes(tagFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          const dateA = new Date(a.dueDate || a.createdAt);
          const dateB = new Date(b.dueDate || b.createdAt);
          return dateA - dateB;

        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );

        case "status":
          const statusOrder = {
            Completed: 4,
            "In Progress": 3,
            Blocked: 2,
            "To Do": 1,
          };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);

        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleAddTask = () => {
    navigate(`/tasks/new?project=${projectId}`);
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    const priorityClass = priority.toLowerCase();
    return (
      <span className={`priority-badge ${priorityClass}`}>{priority}</span>
    );
  };

  if (isLoading) {
    return (
      <div className="project-detail-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading project...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-container">
        <Sidebar />
        <div className="main-content">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={handleBackToDashboard} className="back-button">
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-container">
        <Sidebar />
        <div className="main-content">
          <div className="error-state">
            <p>Project not found</p>
            <button onClick={handleBackToDashboard} className="back-button">
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <Sidebar />

      <div className="main-content">
        <div className="project-header">
          <button onClick={handleBackToDashboard} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Project: {project.name}</h1>
        </div>

        {project.description && (
          <div className="project-description">
            <p>{project.description}</p>
          </div>
        )}

        <div className="project-content">
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Tasks</h2>
              <button onClick={handleAddTask} className="add-task-btn">
                <FaPlus /> Add New Task
              </button>
            </div>

            {/* Filters and Sorting */}
            <div className="filters-container">
              <div className="filter-group">
                <span>
                  <FaFilter /> Filters:
                </span>
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">By Owner (All)</option>
                  {availableOwners.map((ownerId) => (
                    <option key={ownerId} value={ownerId}>
                      Owner: {ownerId}
                    </option>
                  ))}
                </select>

                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">By Tag (All)</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      Tag: {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sort-group">
                <span>
                  <FaSort /> Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            <div className="tasks-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <div className="task-main-info">
                      <h4>{task.name}</h4>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <div className="task-details">
                      <span className={`status ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>

                      <span className="detail">
                        <FaUser />
                        {task.owners && task.owners.length > 0
                          ? typeof task.owners[0] === "object"
                            ? task.owners[0].name
                            : "Assigned"
                          : "Unassigned"}
                      </span>

                      <span className="detail">
                        <FaCalendar />
                        Due:{" "}
                        {new Date(
                          task.dueDate || task.createdAt
                        ).toLocaleDateString()}
                      </span>

                      {task.tags && task.tags.length > 0 && (
                        <span className="detail">
                          <FaTag />
                          {task.tags.join(", ")}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewTask(task._id)}
                      className="view-task-btn"
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>
                    {ownerFilter !== "all" || tagFilter !== "all"
                      ? "No tasks match your filters"
                      : "No tasks found in this project"}
                  </p>
                  <button onClick={handleAddTask} className="add-task-btn">
                    <FaPlus /> Add Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
