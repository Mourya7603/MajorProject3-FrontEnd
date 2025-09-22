import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaEye, FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./ProjectsList.css";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        "https://backend3-project.vercel.app/projects",
        { headers }
      );

      setProjects(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Error fetching projects:", err);
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchTerm) {
      setFilteredProjects(projects);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchLower) ||
        (project.description &&
          project.description.toLowerCase().includes(searchLower))
    );

    setFilteredProjects(filtered);
  };

  const handleAddProject = () => {
    navigate("/projects/new");
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="projects-list-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-list-container">
      <Sidebar />

      <div className="main-content">
        <div className="projects-header">
          <h1>All Projects</h1>
          <div className="header-actions">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={handleAddProject} className="add-project-btn">
              <FaPlus /> Add Project
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project._id} className="project-card">
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                </div>
                <div className="project-card-body">
                  <p className="project-description">
                    {project.description || "No description available"}
                  </p>
                  <div className="project-meta">
                    <span className="project-created">
                      Created:{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="project-card-footer">
                  <button
                    onClick={() => handleViewProject(project._id)}
                    className="view-project-btn"
                  >
                    <FaEye /> View Project
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>
                {searchTerm
                  ? "No projects found matching your search"
                  : "No projects found. Create your first project!"}
              </p>
              <button onClick={handleAddProject} className="add-project-btn">
                <FaPlus /> Add Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
