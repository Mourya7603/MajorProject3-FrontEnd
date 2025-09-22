import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoon, 
  FaSun,
} from "react-icons/fa";
import { useTheme } from '../contexts/ThemeContext';
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/projects", icon: FaProjectDiagram, label: "Projects" },
    { path: "/teams", icon: FaUsers, label: "Teams" },
    { path: "/reports", icon: FaChartBar, label: "Reports" },
    { path: "/settings", icon: FaCog, label: "Settings" },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h3>Workasana</h3>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigateTo(item.path)}
              title={isCollapsed ? item.label : ""}
            >
              <IconComponent className="sidebar-icon" />
              {!isCollapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}
              {isActive(item.path) && !isCollapsed && (
                <div className="active-indicator"></div>
              )}
            </div>
          );
        })}
        
        
      </div>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;