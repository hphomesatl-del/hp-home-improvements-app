import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import ContractorList from './pages/ContractorList';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from API
    fetch('http://localhost:5000/api/projects')
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
          <div className="header-content">
            <Link to="/" className="logo">
              🏗️ HP Home Improvements
            </Link>
            <nav className="nav">
              <Link to="/">Dashboard</Link>
              <Link to="/projects/new">New Project</Link>
              <Link to="/contractors">Contractors</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} loading={loading} />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/contractors" element={<ContractorList />} />
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
