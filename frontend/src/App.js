import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import Portfolio from './pages/Portfolio';
import TeamMembers from './pages/TeamMembers';
import CustomerView from './pages/CustomerView';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from API
    fetch(process.env.REACT_APP_API_URL || 'https://api.hp-home-improvements.up.railway.app/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <span className="phone-number">📞 (404) 931-3686</span>
          </div>
          <div className="header-content">
            <Link to="/" className="logo">
              <img src="/logo.jpg" alt="HP Home Improvements" className="logo-image" />
              <span className="logo-text">HP Home Improvements</span>
            </Link>
            <nav className="nav">
              <Link to="/">Dashboard</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/projects/new">New Project</Link>
              <Link to="/team">Team Members</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} loading={loading} />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/team" element={<TeamMembers />} />
            <Route path="/customer/:projectId" element={<CustomerView />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 HP Home Improvements. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
