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
import CustomerPortal from './pages/CustomerPortal';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Inspirations from './pages/Inspirations';
import Vendors from './pages/Vendors';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

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
    // Listen for login/logout
    const handleStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
              {user?.role === 'admin' && <Link to="/projects">Dashboard</Link>}
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/vendors">Vendors</Link>
              {user?.role === 'admin' && <Link to="/projects/new">New Project</Link>}
              {user?.role === 'admin' && <Link to="/team">Team</Link>}
              {user?.role === 'admin' && <Link to="/admin">Owner Dashboard</Link>}
              {user && user.role !== 'admin' && <Link to="/portal">My Portal</Link>}
              <Link to="/login" className="customer-login-link">{user ? 'Sign Out' : 'Customer Login'}</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              user?.role === 'admin' ? <Navigate to="/admin" /> :
              user ? <Navigate to="/portal" /> :
              <Navigate to="/login" />
            } />
            <Route path="/admin" element={
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to={user ? '/portal' : '/login'} />
            } />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/projects" element={
              user?.role === 'admin'
                ? <Dashboard projects={projects} loading={loading} user={{ role: 'admin' }} />
                : <Navigate to={user ? '/portal' : '/login'} />
            } />
            <Route path="/projects/:id" element={
              user?.role === 'admin' ? <ProjectDetail /> : <Navigate to={user ? '/portal' : '/login'} />
            } />
            <Route path="/projects/new" element={
              user?.role === 'admin' ? <NewProject /> : <Navigate to={user ? '/portal' : '/login'} />
            } />
            <Route path="/team" element={
              user?.role === 'admin' ? <TeamMembers /> : <Navigate to={user ? '/portal' : '/login'} />
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/inspirations" element={<Inspirations />} />
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/portal/project/:projectId" element={<CustomerView />} />
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
