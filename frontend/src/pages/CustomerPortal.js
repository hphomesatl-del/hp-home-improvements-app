import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CustomerPortal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CustomerPortal() {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch projects and contractors in parallel
    Promise.all([
      fetch(`${API_URL}/api/projects`, { headers }).then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      }),
      fetch(`${API_URL}/api/contractors`, { headers }).then(res => res.json())
    ])
      .then(([projectData, contractorData]) => {
        setProjects(Array.isArray(projectData) ? projectData : []);
        setContractors(Array.isArray(contractorData) ? contractorData : []);
        setLoading(false);
      })
      .catch(err => {
        if (err.message !== 'Session expired') {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading your portal...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="customer-portal">
      <div className="portal-header">
        <div className="portal-header-left">
          <h1>Welcome, {user?.name || 'Customer'}</h1>
          <p className="portal-subtitle">HP Home Improvements Customer Portal</p>
        </div>
        <button className="btn logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <div className="portal-tabs">
        <button
          className={`portal-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          🏠 My Project{projects.length !== 1 ? 's' : ''}
        </button>
        <button
          className={`portal-tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          👷 My Team
        </button>
        <button
          className={`portal-tab ${activeTab === 'inspirations' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspirations')}
        >
          ✨ Inspirations
        </button>
      </div>

      <div className="portal-content">
        {activeTab === 'projects' && <ProjectsTab projects={projects} />}
        {activeTab === 'team' && <TeamTab contractors={contractors} />}
        {activeTab === 'inspirations' && <InspirationsTab />}
      </div>

      <div className="portal-footer">
        <p>Questions? Contact HP Home Improvements</p>
        <p>📞 (404) 931-3686 | greg@hphomeimprovements.com</p>
      </div>
    </div>
  );
}

function ProjectsTab({ projects }) {
  if (projects.length === 0) {
    return (
      <div className="no-projects">
        <h2>No Projects Found</h2>
        <p>You don't have any projects assigned yet. Contact HP Home Improvements for assistance.</p>
      </div>
    );
  }

  return (
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
            <p className="view-details">View Details →</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function TeamTab({ contractors }) {
  if (contractors.length === 0) {
    return (
      <div className="no-projects">
        <h2>No Team Members Assigned</h2>
        <p>Your project team will appear here once contractors are assigned.</p>
      </div>
    );
  }

  return (
    <div className="team-grid">
      {contractors.map(c => (
        <div key={c.id} className="team-card">
          <div className="team-card-header">
            <h3>{c.name}</h3>
            <span className="trade-badge">{c.trade}</span>
          </div>
          {c.company && <p className="team-company">{c.company}</p>}
          <div className="team-contact">
            {c.phone && <p>📞 {c.phone}</p>}
            {c.email && <p>✉️ {c.email}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InspirationsTab() {
  const categories = [
    { key: 'kitchens', label: '🍳 Kitchens' },
    { key: 'bathrooms', label: '🛁 Bathrooms' },
    { key: 'decks', label: '🏡 Decks' },
    { key: 'fireplaces', label: '🔥 Fireplaces' },
    { key: 'basements', label: '🏠 Basements' },
    { key: 'flooring', label: '🪵 Flooring' },
    { key: 'closets', label: '👔 Closets' },
    { key: 'beams', label: '🪵 Beams' },
    { key: 'drywall', label: '🧱 Drywall' },
    { key: 'new-builds', label: '🏗️ New Builds' },
  ];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const loadCategory = (cat) => {
    setSelectedCategory(cat);
    setLoadingImages(true);
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/inspirations/${cat}`)
      .then(res => res.json())
      .then(data => {
        setImages(Array.isArray(data) ? data : []);
        setLoadingImages(false);
      })
      .catch(() => setLoadingImages(false));
  };

  return (
    <div className="inspirations-section">
      <p className="inspirations-intro">Browse our portfolio for design inspiration!</p>
      <div className="category-grid">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`category-btn ${selectedCategory === cat.key ? 'active' : ''}`}
            onClick={() => loadCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="inspiration-gallery">
          {loadingImages ? (
            <div className="loading">Loading images...</div>
          ) : images.length === 0 ? (
            <p className="no-images">No images in this category yet.</p>
          ) : (
            <div className="gallery-grid">
              {images.map(img => (
                <div key={img.id} className="gallery-item">
                  <img src={img.url} alt={img.name} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerPortal;
