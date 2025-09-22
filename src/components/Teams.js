import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaUsers,
  FaEdit,
  FaTrash,
  FaTimes,
  FaArrowLeft,
  FaUserPlus,
  FaUser,
  FaUserMinus,
  FaExclamationTriangle
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Teams.css";

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

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Member form state
  const [memberFormData, setMemberFormData] = useState({
    userId: "",
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/teams");
      setTeams(response.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Try to fetch users from your API
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      try {
        // Try to get users from the auth endpoint or tasks
        const tasksResponse = await api.get("/tasks");
        const usersSet = new Set();
        
        // Add current user
        if (currentUser._id || currentUser.id) {
          usersSet.add(JSON.stringify({
            _id: currentUser._id || currentUser.id,
            name: currentUser.name || "You",
            email: currentUser.email || ""
          }));
        }
        
        // Extract users from task owners
        tasksResponse.data.forEach(task => {
          if (task.owners && Array.isArray(task.owners)) {
            task.owners.forEach(owner => {
              if (typeof owner === 'object' && owner._id) {
                usersSet.add(JSON.stringify(owner));
              } else if (typeof owner === 'string') {
                usersSet.add(JSON.stringify({
                  _id: owner,
                  name: `User ${owner}`,
                  email: ""
                }));
              }
            });
          }
        });
        
        const usersArray = Array.from(usersSet).map(userStr => JSON.parse(userStr));
        setAllUsers(usersArray);
      } catch (taskError) {
        console.error("Error fetching tasks for users:", taskError);
        // Fallback to current user only
        setAllUsers([{
          _id: currentUser._id || "current",
          name: currentUser.name || "You",
          email: currentUser.email || ""
        }]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setAllUsers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setMemberFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      if (editingTeam) {
        // Update existing team
        await api.put(`/teams/${editingTeam._id}`, formData);
      } else {
        // Create new team
        await api.post("/teams", formData);
      }

      // Refresh teams list
      fetchTeams();
      closeModal();
    } catch (err) {
      console.error("Error saving team:", err);
      setError("Failed to save team. Please try again.");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberFormData.userId) {
      setError("Please select a user to add");
      return;
    }

    try {
      // Add member to team using the new endpoint
      await api.post(`/teams/${currentTeam._id}/members`, {
        userId: memberFormData.userId
      });

      // Refresh teams list
      fetchTeams();
      closeMemberModal();
      setError("");
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err.response?.data?.error || "Failed to add member. Please try again.");
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      // Remove member from team using the new endpoint
      await api.delete(`/teams/${teamId}/members/${userId}`);

      // Refresh teams list
      fetchTeams();
      setError("");
    } catch (err) {
      console.error("Error removing member:", err);
      setError(err.response?.data?.error || "Failed to remove member. Please try again.");
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
    });
    setIsModalOpen(true);
  };

  const handleAddMemberClick = (team) => {
    setCurrentTeam(team);
    setMemberFormData({ userId: "" });
    setError("");
    setIsMemberModalOpen(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}`);
      // Refresh teams list
      fetchTeams();
    } catch (err) {
      console.error("Error deleting team:", err);
      setError("Failed to delete team. Please try again.");
    }
  };

  const openModal = () => {
    setEditingTeam(null);
    setFormData({ name: "", description: "" });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: "", description: "" });
  };

  const closeMemberModal = () => {
    setIsMemberModalOpen(false);
    setCurrentTeam(null);
    setMemberFormData({ userId: "" });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getUserName = (userId) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const getUserEmail = (userId) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? user.email : "";
  };

  if (isLoading) {
    return (
      <div className="teams-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-container">
      <Sidebar />

      <div className="main-content">
        <div className="teams-header">
          <button onClick={handleBackToDashboard} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Teams Management</h1>
          <button onClick={openModal} className="add-team-btn">
            <FaPlus /> New Team
          </button>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="teams-grid">
          {teams.length > 0 ? (
            teams.map((team) => (
              <div key={team._id} className="team-card">
                <div className="team-card-header">
                  <div className="team-icon">
                    <FaUsers />
                  </div>
                  <h3>{team.name}</h3>
                </div>
                <div className="team-card-body">
                  <p className="team-description">
                    {team.description || "No description provided"}
                  </p>
                  
                  {/* Members List */}
                  <div className="team-members-section">
                    <h4>Members ({team.members ? team.members.length : 0})</h4>
                    {team.members && team.members.length > 0 ? (
                      <div className="members-list">
                        {team.members.map((member) => (
                          <div key={member._id || member} className="member-item">
                            <div className="member-info">
                              <FaUser className="member-icon" />
                              <div>
                                <div className="member-name">
                                  {typeof member === 'object' ? member.name : getUserName(member)}
                                </div>
                                <div className="member-email">
                                  {typeof member === 'object' ? member.email : getUserEmail(member)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(team._id, typeof member === 'object' ? member._id : member)}
                              className="remove-member-btn"
                              title="Remove member"
                            >
                              <FaUserMinus />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-members">No members yet</p>
                    )}
                  </div>
                </div>
                <div className="team-card-footer">
                  <div className="team-actions">
                    <button
                      onClick={() => handleAddMemberClick(team)}
                      className="add-member-btn"
                      title="Add member"
                    >
                      <FaUserPlus />
                    </button>
                    <button
                      onClick={() => handleEdit(team)}
                      className="edit-btn"
                      title="Edit team"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="delete-btn"
                      title="Delete team"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FaUsers />
              </div>
              <h3>No Teams Found</h3>
              <p>Get started by creating your first team</p>
              <button onClick={openModal} className="add-team-btn">
                <FaPlus /> Create Team
              </button>
            </div>
          )}
        </div>

        {/* New/Edit Team Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingTeam ? "Edit Team" : "Create New Team"}</h2>
                <button onClick={closeModal} className="close-btn">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="team-form">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name *</label>
                  <input
                    type="text"
                    id="teamName"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter team name"
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teamDescription">Description</label>
                  <textarea
                    id="teamDescription"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter team description (optional)"
                    rows="3"
                    autoComplete="off"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingTeam ? "Update Team" : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {isMemberModalOpen && currentTeam && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add Member to {currentTeam.name}</h2>
                <button onClick={closeMemberModal} className="close-btn">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="team-form">
                <div className="form-group">
                  <label htmlFor="userId">Select User *</label>
                  <select
                    id="userId"
                    name="userId"
                    value={memberFormData.userId}
                    onChange={handleMemberInputChange}
                    required
                  >
                    <option value="">Select a user</option>
                    {allUsers
                      .filter(user => {
                        // Filter out users already in the team
                        if (!currentTeam.members) return true;
                        return !currentTeam.members.some(member => 
                          (typeof member === 'object' ? member._id : member) === user._id
                        );
                      })
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email || 'no email'})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={closeMemberModal}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;