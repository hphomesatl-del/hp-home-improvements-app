import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CustomerPortal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CustomerPortal() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));

    fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return [];
        }
        return res.json();
      })
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading your projects...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="customer-portal">
      <div className="portal-header">
        <div className="portal-header-left">
          <h1>Welcome, {user?.name || 'Customer'}</h1>
          <p className="portal-subtitle">Your Home Improvement Projects</p>
        </div>
        <button className="btn logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="no-projects">
          <h2>No Projects Found</h2>
          <p>You don't have any projects assigned to your account yet. Please contact HP Home Improvements for assistance.</p>
          <p>📞 (404) 931-3686 | greg@hphomeimprovements.com</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link to={`/portal/project/${project.id}`} key={project.id} className="project-card-link">
              <div className="portal-project-card">
                <h3>{project.address}</h3>
                <p className="project-customer">{project.customer_name}</p>
                <div className="project-meta">
                  <span className={`status-badge status-${(project.status || 'planning').replace(/\s+/g, '-').toLowerCase()}`}>
                    {project.status || 'Planning'}
                  </span>
                  {project.estimated_budget && (
                    <span className="project-budget">
                      ${parseFloat(project.estimated_budget).toLocaleString()}
                    </span>
                  )}
                </div>
                {project.start_date && (
                  <p className="project-date">Started: {new Date(project.start_date).toLocaleDateString()}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="portal-footer">
        <p>Questions? Contact HP Home Improvements</p>
        <p>📞 (404) 931-3686 | greg@hphomeimprovements.com</p>
      </div>
    </div>
  );
}

export default CustomerPortal;
