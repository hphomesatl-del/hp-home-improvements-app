import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '../styles/CustomerView.css';

function CustomerView() {
  const { projectId } = useParams();
  const location = useLocation();
  const isPortalView = location.pathname.startsWith('/portal/');
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Fetch project
    fetch(`${apiUrl}/api/projects/${projectId}`, { headers })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => setProject(data))
      .catch(err => setError(err.message));

    // Fetch phases
    fetch(`${apiUrl}/api/phases/project/${projectId}`, { headers })
      .then(res => res.json())
      .then(data => {
        setPhases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div className="loading">Loading project details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="customer-view">
      {isPortalView && (
        <div className="portal-nav">
          <Link to="/portal" className="back-link">← Back to My Projects</Link>
        </div>
      )}
      <div className="customer-header">
        <h1>Project Status: {project.customer_name}</h1>
        <p className="customer-address">{project.address}</p>
      </div>

      <div className="customer-info">
        <div className="info-card">
          <h3>Project Timeline</h3>
          <p className="info-value">
            Start: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
          </p>
          <p className="info-subtitle">Duration: {phases.length > 0 ? phases[phases.length - 1].planned_start_day + (phases[phases.length - 1].planned_duration_days || 0) - 1 : 'TBD'} days</p>
        </div>

        <div className="info-card">
          <h3>Project Budget</h3>
          <p className="info-value">${parseFloat(project.estimated_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="info-subtitle">Estimated Total</p>
        </div>

        <div className="info-card">
          <h3>Project Status</h3>
          <p className="info-value status-pill">{project.status}</p>
          <p className="info-subtitle">Current Phase</p>
        </div>
      </div>

      {project.notes && (
        <div className="project-notes">
          <h3>Project Details & Estimate</h3>
          <div className="notes-content">
            {project.notes.split('\n').map((line, idx) => (
              <p key={idx} className={line.startsWith('-') ? 'note-item' : 'note-text'}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="timeline-section">
        <h3>Renovation Timeline ({phases.length} Phases)</h3>
        <div className="timeline-container">
          {phases.map((phase) => (
            <div key={phase.id} className="timeline-item">
              <div className="phase-number">{phase.phase_order}</div>
              <div className="phase-details">
                <h4>{phase.name}</h4>
                <p className="phase-days">Days {phase.planned_start_day}-{phase.planned_start_day + (phase.planned_duration_days || 1) - 1}</p>
                <p className="phase-duration">{phase.planned_duration_days} day(s)</p>
              </div>
              <div className="phase-status">{phase.status || 'planned'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="customer-footer">
        <p>Questions? Contact HP Home Improvements</p>
        <p>📞 (404) 931-3686 | greg@hphomeimprovements.com</p>
      </div>
    </div>
  );
}

export default CustomerView;
