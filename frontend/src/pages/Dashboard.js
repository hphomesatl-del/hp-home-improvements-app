import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ projects, loading }) {
  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  const getStatusClass = (status) => {
    return `project-status status-${status}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Projects</h1>
        <Link to="/projects/new" className="btn">
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create a new project to get started managing your renovations.</p>
          <Link to="/projects/new" className="btn" style={{ marginTop: '1rem' }}>
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.customer_name}</h3>
              <p>
                <strong>Address:</strong> {project.address}
              </p>
              {project.customer_email && (
                <p>
                  <strong>Email:</strong> {project.customer_email}
                </p>
              )}
              {project.estimated_budget && (
                <p>
                  <strong>Budget:</strong> ${project.estimated_budget.toLocaleString()}
                </p>
              )}
              <p>
                <strong>Status:</strong> <span className={getStatusClass(project.status)}>{project.status}</span>
              </p>
              {project.current_phase && (
                <div style={{
                  margin: '0.75rem 0',
                  padding: '0.5rem 0.75rem',
                  background: project.status === 'in_progress' ? '#fff3e0' : project.status === 'completed' ? '#e8f5e9' : '#e3f2fd',
                  border: `2px solid ${project.status === 'in_progress' ? '#ff9800' : project.status === 'completed' ? '#4caf50' : '#2196f3'}`,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  color: project.status === 'in_progress' ? '#e65100' : project.status === 'completed' ? '#2e7d32' : '#1565c0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span>{project.status === 'in_progress' ? '🔨' : project.status === 'completed' ? '✅' : '📋'}</span>
                  <span>{project.current_phase} — {project.status === 'in_progress' ? 'In Progress' : project.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </div>
              )}
              <p>
                <strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/customer/${project.id}`} className="btn" style={{ flex: 1 }}>
                  View Details
                </Link>
                <Link to={`/projects/${project.id}`} className="btn secondary" style={{ flex: 1 }}>
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
