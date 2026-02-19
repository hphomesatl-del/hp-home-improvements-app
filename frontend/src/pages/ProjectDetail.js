import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading">Loading project...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div>
      <button className="btn secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← Back to Projects
      </button>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h1>{project.customer_name}</h1>
        <p><strong>Address:</strong> {project.address}</p>
        <p><strong>Email:</strong> {project.customer_email || 'Not provided'}</p>
        <p><strong>Phone:</strong> {project.customer_phone || 'Not provided'}</p>
        <p><strong>Status:</strong> {project.status}</p>
        {project.estimated_budget && (
          <p><strong>Estimated Budget:</strong> ${project.estimated_budget.toLocaleString()}</p>
        )}
        {project.actual_budget && (
          <p><strong>Actual Budget:</strong> ${project.actual_budget.toLocaleString()}</p>
        )}
        {project.notes && (
          <p><strong>Notes:</strong> {project.notes}</p>
        )}

        <hr style={{ margin: '2rem 0' }} />

        <h2>Project Phases ({project.phases?.length || 0})</h2>
        {project.phases && project.phases.length > 0 ? (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phase</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Contractor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {project.phases.map((phase) => (
                <tr key={phase.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{phase.name}</td>
                  <td style={{ padding: '0.75rem' }}>{phase.contractor_id || 'TBD'}</td>
                  <td style={{ padding: '0.75rem' }}>{phase.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No phases yet</p>
        )}

        <hr style={{ margin: '2rem 0' }} />

        <h2>Customer Decisions ({project.decisions?.length || 0})</h2>
        {project.decisions && project.decisions.length > 0 ? (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {project.decisions.map((decision) => (
                <tr key={decision.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{decision.category}</td>
                  <td style={{ padding: '0.75rem' }}>{decision.status}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {decision.deadline ? new Date(decision.deadline).toLocaleDateString() : 'Not set'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No decisions yet</p>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
