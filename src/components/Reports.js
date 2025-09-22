import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaFilter, 
  FaCalendar, 
  FaExclamationTriangle, 
  FaSync,
  FaUsers,
  FaUser,
  FaProjectDiagram
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Reports.css";

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// axios instance
const api = axios.create({ baseURL: "https://backend3-project.vercel.app" });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const Reports = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [reportData, setReportData] = useState({
    completedTasks: [],
    pending: { totalDaysPending: 0, pendingTasksCount: 0 },
    byTeam: [],
    byOwner: [],
    byProject: []
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchReportData();
  }, [dateRange, retryCount, navigate]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [completedRes, pendingRes, teamRes, ownerRes, projectRes] = await Promise.allSettled([
        api.get(`/report/completed-tasks?startDate=${dateRange.start}&endDate=${dateRange.end}`),
        api.get('/report/pending'),
        api.get('/report/grouped-tasks?groupBy=team&status=Completed'),
        api.get('/report/grouped-tasks?groupBy=owners&status=Completed'),
        api.get('/report/grouped-tasks?groupBy=project&status=Completed')
      ]);

      // Process completed tasks
      const completedTasks = completedRes.status === 'fulfilled' ? completedRes.value.data : [];
      
      // Process pending work
      const pendingData = pendingRes.status === 'fulfilled' ? pendingRes.value.data : { totalDaysPending: 0, pendingTasksCount: 0 };
      
      // Process grouped data
      const byTeam = teamRes.status === 'fulfilled' ? teamRes.value.data : [];
      const byOwner = ownerRes.status === 'fulfilled' ? ownerRes.value.data : [];
      const byProject = projectRes.status === 'fulfilled' ? projectRes.value.data : [];

      setReportData({
        completedTasks,
        pending: pendingData,
        byTeam,
        byOwner,
        byProject
      });

    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(
        err.response?.data?.error || 
        "Failed to load reports. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => navigate("/dashboard");
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };
  const handleRetry = () => setRetryCount(prev => prev + 1);

  const exportReports = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `workasana-reports-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Prepare chart data
  const prepareDateData = () => {
    const dailyCounts = {};
    reportData.completedTasks.forEach(task => {
      const date = new Date(task.updatedAt).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const labels = Object.keys(dailyCounts).sort();
    const data = labels.map(date => dailyCounts[date]);

    return { labels, data };
  };

  const dateData = prepareDateData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, font: { size: 16 } }
    },
  };

  if (isLoading) {
    return (
      <div className="reports-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <Sidebar />
      <div className="main-content">
        <div className="reports-header">
          <button onClick={handleBackToDashboard} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Workasana Reports</h1>
          <div>
            <button onClick={handleRetry} className="retry-btn">
              <FaSync /> Retry
            </button>
            <button onClick={exportReports} className="export-button">
              <FaDownload /> Export Reports
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="date-filter">
          <div className="filter-group">
            <FaCalendar className="filter-icon" />
            <span>Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="date-input"
            />
            <button onClick={fetchReportData} className="apply-filter-btn">
              <FaFilter /> Apply Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              <FaSync /> Try Again
            </button>
          </div>
        )}

        <div className="reports-grid">
          {/* Completed Tasks Chart */}
          <div className="report-card">
            <h3><FaCalendar /> Tasks Completed ({dateRange.start} to {dateRange.end})</h3>
            <div className="chart-container">
              <Bar
                data={{
                  labels: dateData.labels,
                  datasets: [
                    {
                      label: 'Tasks Completed',
                      data: dateData.data,
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Daily Completed Tasks'
                    }
                  }
                }}
              />
            </div>
            <div className="report-summary">
              <p>Total completed: <strong>{reportData.completedTasks.length}</strong></p>
              <p>Date range: {dateRange.start} to {dateRange.end}</p>
            </div>
          </div>

          {/* Pending Work */}
          <div className="report-card">
            <h3><FaExclamationTriangle /> Pending Work</h3>
            <div className="chart-container">
              <Doughnut
                data={{
                  labels: ['Pending Days', 'Estimated Completion'],
                  datasets: [
                    {
                      data: [
                        reportData.pending.totalDaysPending,
                        Math.max(0, reportData.pending.totalDaysPending * 0.6)
                      ],
                      backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                      borderColor: ['rgba(239, 68, 68, 1)', 'rgba(34, 197, 94, 1)'],
                      borderWidth: 1,
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
            <div className="report-summary">
              <p>Pending tasks: <strong>{reportData.pending.pendingTasksCount}</strong></p>
              <p>Total days pending: <strong>{reportData.pending.totalDaysPending}</strong></p>
            </div>
          </div>

          {/* Tasks by Team */}
          <div className="report-card">
            <h3><FaUsers /> Tasks by Team</h3>
            <div className="chart-container">
              <Pie
                data={{
                  labels: reportData.byTeam.map(item => item.name || 'Unknown Team'),
                  datasets: [
                    {
                      data: reportData.byTeam.map(item => item.count),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(249, 115, 22, 0.8)'
                      ],
                      borderWidth: 1,
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Tasks by Owner */}
          <div className="report-card">
            <h3><FaUser /> Tasks by Owner</h3>
            <div className="chart-container">
              <Bar
                data={{
                  labels: reportData.byOwner.map(item => item.name || 'Unknown Owner').slice(0, 10),
                  datasets: [
                    {
                      label: 'Tasks Completed',
                      data: reportData.byOwner.map(item => item.count).slice(0, 10),
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1,
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Top 10 Performers'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <h4>Total Completed</h4>
            <div className="stat-value">{reportData.completedTasks.length}</div>
            <p>Tasks completed in selected period</p>
          </div>
          <div className="stat-card">
            <h4>Pending Work</h4>
            <div className="stat-value">{reportData.pending.pendingTasksCount}</div>
            <p>Tasks awaiting completion</p>
          </div>
          <div className="stat-card">
            <h4>Teams Active</h4>
            <div className="stat-value">{reportData.byTeam.length}</div>
            <p>Teams with completed tasks</p>
          </div>
          <div className="stat-card">
            <h4>Active Users</h4>
            <div className="stat-value">{reportData.byOwner.length}</div>
            <p>Users with completed tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;