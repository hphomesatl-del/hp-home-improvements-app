import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '').replace(/\/$/, '');
const TRADES = ['electric', 'plumbing', 'framing'];

function FileUploadZone({ onUpload, accept, label }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files.length) onUpload(e.target.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#2563eb' : '#cbd5e1'}`,
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'center',
        background: dragging ? '#eff6ff' : '#f8fafc',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '1rem'
      }}
      onClick={() => document.getElementById(label)?.click()}
    >
      <input id={label} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
      <p style={{ margin: 0, color: '#64748b' }}>📁 Drag & drop or click to upload</p>
    </div>
  );
}

function PlansSection({ projectId }) {
  const [plans, setPlans] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadPlans = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/plans`);
    setPlans(await res.json());
  }, [projectId]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const uploadPlan = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`${API_URL}/api/projects/${projectId}/plans`, { method: 'POST', body: fd });
    await loadPlans();
    setUploading(false);
  };

  const deletePlan = async (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    await fetch(`${API_URL}/api/projects/${projectId}/plans/${planId}`, { method: 'DELETE' });
    await loadPlans();
  };

  const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <div>
      <h2>📐 Project Plans ({plans.length})</h2>
      <FileUploadZone onUpload={uploadPlan} accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.dwg" label="plan-upload" />
      {uploading && <p>Uploading...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', background: '#fff' }}>
            {isImage(plan.file_name) ? (
              <img
                src={`${API_URL}/uploads/plans/${plan.file_path}`}
                alt={plan.file_name}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }}
              />
            ) : (
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '2rem' }}>
                📄
              </div>
            )}
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {plan.file_name}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`${API_URL}/uploads/plans/${plan.file_path}`} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.8rem', color: '#2563eb' }}>View</a>
              <button onClick={() => deletePlan(plan.id)}
                style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradePhotosSection({ projectId }) {
  const [activeTrade, setActiveTrade] = useState('electric');
  const [photos, setPhotos] = useState({});
  const [uploading, setUploading] = useState(false);

  const loadPhotos = useCallback(async (trade) => {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/photos/${trade}`);
    const data = await res.json();
    setPhotos(prev => ({ ...prev, [trade]: data }));
  }, [projectId]);

  useEffect(() => { TRADES.forEach(t => loadPhotos(t)); }, [loadPhotos]);

  const uploadPhoto = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`${API_URL}/api/projects/${projectId}/photos/${activeTrade}`, { method: 'POST', body: fd });
    await loadPhotos(activeTrade);
    setUploading(false);
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    await fetch(`${API_URL}/api/projects/${projectId}/photos/${photoId}`, { method: 'DELETE' });
    await loadPhotos(activeTrade);
  };

  const tradePhotos = photos[activeTrade] || [];
  const tradeIcons = { electric: '⚡', plumbing: '🔧', framing: '🏗️' };

  return (
    <div>
      <h2>📸 Trade Photos</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {TRADES.map(trade => (
          <button
            key={trade}
            onClick={() => setActiveTrade(trade)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: activeTrade === trade ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: activeTrade === trade ? '#eff6ff' : '#fff',
              fontWeight: activeTrade === trade ? 'bold' : 'normal',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tradeIcons[trade]} {trade} ({(photos[trade] || []).length})
          </button>
        ))}
      </div>

      <FileUploadZone onUpload={uploadPhoto} accept="image/*" label={`photo-upload-${activeTrade}`} />
      {uploading && <p>Uploading...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {tradePhotos.map(photo => (
          <div key={photo.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <img
              src={`${API_URL}/uploads/photos/${photo.file_path}`}
              alt={photo.file_name}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.5rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {photo.file_name}
              </p>
              <button onClick={() => deletePhoto(photo.id)}
                style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        {tradePhotos.length === 0 && <p style={{ color: '#94a3b8' }}>No {activeTrade} photos yet</p>}
      </div>
    </div>
  );
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/projects/${id}`)
      .then(res => res.json())
      .then(data => { setProject(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
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
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phase</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Contractor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dates</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {project.phases.map((phase) => {
                const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                const startDate = phase.actual_start_date || phase.planned_start_date;
                const endDate = phase.actual_end_date || phase.planned_end_date;
                const dateRange = startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'TBD';
                const statusColor = phase.status === 'completed' ? '#28a745' : phase.status === 'in_progress' ? '#ffc107' : '#6c757d';
                return (
                  <tr key={phase.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#666' }}>{phase.phase_order}</td>
                    <td style={{ padding: '0.75rem' }}>{phase.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {phase.contractor_name ? (
                        <div>
                          <strong>{phase.contractor_name}</strong>
                          <br />
                          <span style={{ fontSize: '0.85em', color: '#666' }}>{phase.contractor_trade}</span>
                          {phase.contractor_phone && (
                            <span style={{ fontSize: '0.85em', color: '#888', marginLeft: '0.5rem' }}>
                              📞 {phase.contractor_phone}
                            </span>
                          )}
                        </div>
                      ) : 'TBD'}
                    </td>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{dateRange}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        background: statusColor,
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}>
                        {phase.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
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

        <hr style={{ margin: '2rem 0' }} />
        <PlansSection projectId={id} />

        <hr style={{ margin: '2rem 0' }} />
        <TradePhotosSection projectId={id} />
      </div>
    </div>
  );
}

export default ProjectDetail;
