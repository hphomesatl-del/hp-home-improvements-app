import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import Portfolio from './pages/Portfolio';
import TeamMembers from './pages/TeamMembers';
import CustomerView from './pages/CustomerView';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (data) setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <span className="phone-number">📞 (404) 931-3686</span>
          </div>
          <div className="header-content">
            <Link to="/projects" className="logo">
              <img src="/logo.jpg" alt="HP Home Improvements" className="logo-image" />
              <span className="logo-text">HP Home Improvements</span>
            </Link>
            <nav className="nav">
              <Link to="/projects">Dashboard</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/projects/new">New Project</Link>
              <Link to="/team">Team</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projects" element={
              <Dashboard projects={projects} loading={loading} user={{ role: 'admin' }} />
            } />
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
