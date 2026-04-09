# Workasana - Project Management App

A full-featured project management and team collaboration platform. Workasana helps teams track projects, manage tasks, collaborate within teams, and generate insightful reports.

🌐 **Live Demo:** [major-project3-front-end.vercel.app](https://major-project3-front-end.vercel.app)

---

## ✨ Features

### Core Functionality
- **User Authentication** - Secure signup and login system
- **Dashboard** - Overview of all projects and personal tasks
- **Project Management** - Create, view, and manage projects
- **Task Management** - Create, assign, and track tasks with status updates
- **Team Management** - Create teams and manage team members
- **Dark/Light Theme** - Toggle between dark and light mode for comfortable viewing

### Reports & Analytics
- **Daily Completed Tasks** - Visual chart of tasks completed over time
- **Pending Work Analysis** - Track pending days and tasks
- **Team Performance** - Tasks closed by team (Pie chart)
- **Individual Performance** - Tasks closed by owner (Bar chart)
- **Date Range Filtering** - Custom date selection for reports

### User Experience
- Responsive design for desktop and mobile
- Real-time data updates
- Intuitive navigation with collapsible sidebar
- Form validation and error handling

---

## 🛠️ Technologies

| Category | Technologies |
|----------|-------------|
| **Frontend** | React.js, React Router, Context API |
| **Styling** | CSS3 with Dark/Light theme support |
| **Charts** | Chart.js for data visualization |
| **HTTP Client** | Axios |
| **Icons** | React Icons (Fa icons family) |

---

## 🚀 Quick Start

bash
# Clone the repository
git clone https://github.com/Mourya7603/MajorProject3-FrontEnd.git
cd MajorProject3-FrontEnd

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

---
## 📡 API Integration

This frontend connects to a backend API at `https://backend3-project.vercel.app`

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/signup` | User registration |
| GET | `/projects` | Fetch all projects |
| GET | `/tasks` | Fetch all tasks |
| GET | `/teams` | Fetch all teams |
| POST | `/projects` | Create new project |
| POST | `/tasks` | Create new task |
| POST | `/teams` | Create new team |
| GET | `/report/last-week` | Get last week's completed tasks |
| GET | `/report/pending` | Get pending work summary |
| GET | `/report/closed-tasks` | Get grouped closed tasks |

---

## 🎯 Features in Detail

### Authentication
- JWT token-based authentication
- Protected routes for authenticated users
- Automatic redirect to login on session expiry

### Dashboard
- Personal task list filtered by current user
- All projects overview
- Search functionality for tasks and projects
- Status filters (To Do, In Progress, Completed, Blocked)

### Project Management
- Create new projects with name and description
- View project details with associated tasks
- Filter tasks by owner and tags
- Sort tasks by due date, priority, or status

### Task Management
- Create tasks with name, project, team, owners, tags
- Set estimated completion time
- Update task status (To Do, In Progress, Completed, Blocked)
- Mark tasks as complete with one click

### Team Management
- Create teams with name and description
- Add/remove team members
- View team members list

### Reports
- Visual charts for work completed
- Pending work analysis
- Team and individual performance metrics
- Date range filtering
- Export reports as JSON

### Settings
- Profile information update
- Password change
- Notification preferences
- Theme customization (Light/Dark)
- Data export and account deletion

---

## 🎨 Theme Support

Workasana includes both **Light** and **Dark** themes:
- Toggle via sidebar button or settings page
- Preference saved in localStorage
- Smooth transitions between themes

---

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

The sidebar collapses on smaller screens for better space utilization.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. Please contact the maintainer for permission to use or modify.

---

## 📧 Contact

**Developer:** Mangalapalli Mourya

**Email:** magalapallimourya@gmail.com

**GitHub:** [@Mourya7603](https://github.com/Mourya7603)

---

## 🔗 Related Repositories

- **Frontend:** [MajorProject3-FrontEnd](https://github.com/Mourya7603/MajorProject3-FrontEnd)

---

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Chart.js for data visualization
- Vercel for hosting

---

⭐ If you found this project helpful, please give it a star on GitHub!
```

This README provides a complete overview of your Workasana project, including features, technologies, setup instructions, project structure, API endpoints, and usage details. You can copy this directly into your GitHub repository's `README.md` file.
