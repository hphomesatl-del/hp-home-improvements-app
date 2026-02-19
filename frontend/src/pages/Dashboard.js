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
              <p>
                <strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
              <Link to={`/projects/${project.id}`} className="btn" style={{ marginTop: '1rem' }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
