import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '').replace(/\/$/, '');

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) { navigate('/login'); return; }

    const parsed = JSON.parse(userData);
    if (parsed?.role !== 'admin') { navigate('/portal'); return; }
    setUser(parsed);

    fetch(`${API_URL}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
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

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  const { projects, contractors, stats } = data;

  const filteredProjects = statusFilter === 'all'
    ? projects
    : projects.filter(p => (p.current_status || p.status || '').toLowerCase().includes(statusFilter));

  const totalBudget = parseFloat(stats.total_budget) || 0;
  const totalSpent = parseFloat(stats.total_spent) || 0;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>🏗️ Owner Dashboard</h1>
          <p className="admin-subtitle">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <div className="admin-header-right">
          <Link to="/projects" className="btn admin-btn-secondary">Legacy View</Link>
          <Link to="/projects/new" className="btn admin-btn-primary">+ New Project</Link>
          <button className="btn admin-btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-number">{stats.total_projects}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-number">{stats.active_projects}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-planning">
          <div className="stat-number">{stats.planning_projects}</div>
          <div className="stat-label">Planning</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed_projects}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-budget">
          <div className="stat-number">${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Pipeline</div>
        </div>
        <div className="stat-card stat-contractors">
          <div className="stat-number">{stats.total_contractors}</div>
          <div className="stat-label">Contractors</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 All Projects
        </button>
        <button className={`admin-tab ${activeTab === 'contractors' ? 'active' : ''}`} onClick={() => setActiveTab('contractors')}>
          👷 Contractors
        </button>
        <button className={`admin-tab ${activeTab === 'pipeline' ? 'active' : ''}`} onClick={() => setActiveTab('pipeline')}>
          📈 Pipeline
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <ProjectsOverview
            projects={filteredProjects}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}
        {activeTab === 'contractors' && <ContractorsView contractors={contractors} />}
        {activeTab === 'pipeline' && <PipelineView projects={projects} totalBudget={totalBudget} totalSpent={totalSpent} />}
      </div>
    </div>
  );
}

function ProjectsOverview({ projects, statusFilter, setStatusFilter }) {
  return (
    <div className="projects-overview">
      <div className="overview-header">
        <h2>All Projects ({projects.length})</h2>
        <div className="filter-bar">
          {['all', 'planning', 'in_progress', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' ? 'All' : f.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-projects-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Address</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Start Date</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const total = parseInt(p.total_phases) || 0;
              const done = parseInt(p.completed_phases) || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <tr key={p.id}>
                  <td className="td-customer">
                    <strong>{p.customer_name}</strong>
                    {p.category && (
                      <span className={`category-badge category-${p.category.toLowerCase()}`}>
                        {p.category}
                      </span>
                    )}
                  </td>
                  <td className="td-address">{p.address}</td>
                  <td>
                    <span className={`admin-status-badge status-${(p.current_status || p.status || 'planning').replace(/[\s_]/g, '-').toLowerCase()}`}>
                      {p.current_status || p.status || 'Planning'}
                    </span>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="progress-text">{done}/{total} phases ({pct}%)</span>
                    </div>
                  </td>
                  <td className="td-budget">
                    {p.estimated_budget ? `$${parseFloat(p.estimated_budget).toLocaleString()}` : '—'}
                  </td>
                  <td>{p.start_date ? new Date(p.start_date).toLocaleDateString() : '—'}</td>
                  <td className="td-contact">
                    {p.customer_email && <div>✉️ {p.customer_email}</div>}
                    {p.customer_phone && <div>📞 {p.customer_phone}</div>}
                  </td>
                  <td className="td-actions">
                    <Link to={`/customer/${p.id}`} className="action-link view">View</Link>
                    <Link to={`/projects/${p.id}`} className="action-link edit">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projects.length === 0 && <p className="no-data">No projects match this filter.</p>}
      </div>
    </div>
  );
}

function ContractorsView({ contractors }) {
  return (
    <div className="contractors-view">
      <h2>All Contractors ({contractors.length})</h2>
      <div className="contractors-grid">
        {contractors.map(c => (
          <div key={c.id} className="admin-contractor-card">
            <div className="contractor-card-top">
              <h3>{c.name}</h3>
              <span className="trade-badge">{c.trade}</span>
            </div>
            {c.company && <p className="contractor-company">{c.company}</p>}
            <div className="contractor-details">
              {c.phone && <p>📞 {c.phone}</p>}
              {c.email && <p>✉️ {c.email}</p>}
              {c.crew && <p>👥 {c.crew}</p>}
            </div>
            <div className="contractor-assignments">
              <span className="assignment-count">{c.project_count || 0} project{c.project_count !== 1 ? 's' : ''}</span>
              {c.assigned_projects && <p className="assigned-list">{c.assigned_projects}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineView({ projects, totalBudget, totalSpent }) {
  const statusGroups = {};
  projects.forEach(p => {
    const s = (p.current_status || p.status || 'planning').toLowerCase();
    if (!statusGroups[s]) statusGroups[s] = [];
    statusGroups[s].push(p);
  });

  return (
    <div className="pipeline-view">
      <h2>Project Pipeline</h2>

      <div className="pipeline-summary">
        <div className="pipeline-stat">
          <span className="pipeline-label">Total Pipeline Value</span>
          <span className="pipeline-value">${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        {totalSpent > 0 && (
          <div className="pipeline-stat">
            <span className="pipeline-label">Total Spent</span>
            <span className="pipeline-value">${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        )}
      </div>

      <div className="pipeline-columns">
        {Object.entries(statusGroups).map(([status, prjs]) => (
          <div key={status} className="pipeline-column">
            <div className="pipeline-column-header">
              <h3>{status.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
              <span className="pipeline-count">{prjs.length}</span>
            </div>
            {prjs.map(p => (
              <Link to={`/customer/${p.id}`} key={p.id} className="pipeline-card">
                <strong>{p.customer_name}</strong>
                {p.category && <span className={`category-badge category-${p.category.toLowerCase()}`}>{p.category}</span>}
                <span className="pipeline-address">{p.address}</span>
                {p.estimated_budget && (
                  <span className="pipeline-budget">${parseFloat(p.estimated_budget).toLocaleString()}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
