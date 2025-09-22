import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ProjectsList from "./components/ProjectsList";
import ProjectDetail from "./components/ProjectDetail";
import AddProject from "./components/AddProject";
import AddTask from "./components/AddTask";
import Reports from "./components/Reports";
import Teams from "./components/Teams";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
     <ThemeProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setToken={setToken} setUser={setUser} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              token ? (
                <Navigate to="/dashboard" />
              ) : (
                <Signup setToken={setToken} setUser={setUser} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              token ? <Dashboard user={user} /> : <Navigate to="/login" />
            }
          />

          {/* Projects Routes */}
          <Route
            path="/projects"
            element={token ? <ProjectsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/projects/new"
            element={token ? <AddProject /> : <Navigate to="/login" />}
          />
          <Route
            path="/projects/:projectId"
            element={token ? <ProjectDetail /> : <Navigate to="/login" />}
          />

          {/* Tasks Routes */}
          <Route
            path="/tasks/new"
            element={token ? <AddTask /> : <Navigate to="/login" />}
          />
          {/* <Route
            path="/tasks/:taskId"
            element={token ? <TaskDetails /> : <Navigate to="/login" />}
          /> */}
          <Route
            path="/teams"
            element={token ? <Teams /> : <Navigate to="/login" />}
          />

          {/* Reports Route */}
          <Route
            path="/reports"
            element={token ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={token ? <Settings /> : <Navigate to="/login" />}
          />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
