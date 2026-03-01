import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '../styles/CustomerView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/* ── Photo Lightbox ── */
function PhotoLightbox({ photo, onClose }) {
  if (!photo) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    }} onClick={onClose}>
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: -12, right: -12, background: '#fff', border: 'none',
          borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', fontWeight: 'bold'
        }}>✕</button>
        <img
          src={`${API_URL}/uploads/customer-photos/${photo.file_path}`}
          alt={photo.caption || photo.file_name}
          style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }}
        />
        {photo.caption && (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: 8, fontSize: '0.95rem' }}>{photo.caption}</p>
        )}
      </div>
    </div>
  );
}

/* ── Photo Upload Section ── */
function TimelinePhotos({ projectId, phases }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [caption, setCaption] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [filterPhase, setFilterPhase] = useState('all');

  const loadPhotos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/timeline-photos`, { headers: getHeaders() });
      if (res.ok) setPhotos(await res.json());
    } catch (e) { console.error('Failed to load photos', e); }
  }, [projectId]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('photos', f));
    if (selectedPhase) fd.append('phase_id', selectedPhase);
    if (caption.trim()) fd.append('caption', caption.trim());

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/timeline-photos`, {
        method: 'POST', headers: getHeaders(), body: fd
      });
      if (res.ok) {
        setCaption('');
        await loadPhotos();
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (e) { alert('Upload failed: ' + e.message); }
    setUploading(false);
    e.target.value = '';
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    await fetch(`${API_URL}/api/projects/${projectId}/timeline-photos/${photoId}`, {
      method: 'DELETE', headers: getHeaders()
    });
    await loadPhotos();
  };

  const filtered = filterPhase === 'all' ? photos
    : filterPhase === 'none' ? photos.filter(p => !p.phase_id)
    : photos.filter(p => p.phase_id === filterPhase);

  return (
    <div className="timeline-photos-section">
      <h3>📸 Project Photos ({photos.length})</h3>

      {/* Upload Controls */}
      <div style={{
        background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
          <select
            value={selectedPhase}
            onChange={e => setSelectedPhase(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 180 }}
          >
            <option value="">— No specific phase —</option>
            {phases.map(ph => (
              <option key={ph.id} value={ph.id}>{ph.phase_order}. {ph.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add a caption or note..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', flex: 1, minWidth: 200 }}
          />
        </div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.25rem',
          background: '#2563eb', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
        }}>
          {uploading ? '⏳ Uploading...' : '📷 Upload Photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ marginLeft: 12, color: '#94a3b8', fontSize: '0.85rem' }}>Max 10 images, 10MB each</span>
      </div>

      {/* Filter */}
      {photos.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterPhase('all')}
            style={filterBtnStyle(filterPhase === 'all')}>All ({photos.length})</button>
          <button onClick={() => setFilterPhase('none')}
            style={filterBtnStyle(filterPhase === 'none')}>General</button>
          {phases.filter(ph => photos.some(p => p.phase_id === ph.id)).map(ph => (
            <button key={ph.id} onClick={() => setFilterPhase(ph.id)}
              style={filterBtnStyle(filterPhase === ph.id)}>
              {ph.phase_order}. {ph.name} ({photos.filter(p => p.phase_id === ph.id).length})
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {filtered.map(photo => {
          const thumbSrc = photo.thumbnail_path
            ? `${API_URL}/uploads/customer-photos/thumbs/${photo.thumbnail_path}`
            : `${API_URL}/uploads/customer-photos/${photo.file_path}`;
          return (
            <div key={photo.id} style={{
              border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <img
                src={thumbSrc}
                alt={photo.caption || photo.file_name}
                style={{ width: '100%', height: 150, objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setLightboxPhoto(photo)}
              />
              <div style={{ padding: '0.5rem 0.65rem' }}>
                {photo.caption && (
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#334155' }}>{photo.caption}</p>
                )}
                {photo.phase_name && (
                  <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#2563eb' }}>
                    📌 {photo.phase_order}. {photo.phase_name}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </span>
                  <button onClick={() => deletePhoto(photo.id)} style={{
                    background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem'
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && photos.length > 0 && (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No photos for this filter</p>
      )}
      {photos.length === 0 && (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
          No photos uploaded yet. Use the upload button above to add photos of your renovation!
        </p>
      )}

      <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
}

function filterBtnStyle(active) {
  return {
    padding: '0.35rem 0.85rem', borderRadius: 20, fontSize: '0.82rem', cursor: 'pointer',
    border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
    background: active ? '#eff6ff' : '#fff', fontWeight: active ? 600 : 400, color: active ? '#2563eb' : '#475569'
  };
}

/* ── Inline Phase Photos ── */
function PhasePhotos({ photos, onView }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
      {photos.slice(0, 4).map(p => {
        const src = p.thumbnail_path
          ? `${API_URL}/uploads/customer-photos/thumbs/${p.thumbnail_path}`
          : `${API_URL}/uploads/customer-photos/${p.file_path}`;
        return (
          <img key={p.id} src={src} alt={p.caption || ''} onClick={() => onView(p)}
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0' }} />
        );
      })}
      {photos.length > 4 && (
        <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>+{photos.length - 4} more</span>
      )}
    </div>
  );
}

function CustomerView() {
  const { projectId } = useParams();
  const location = useLocation();
  const isPortalView = location.pathname.startsWith('/portal/');
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [timelinePhotos, setTimelinePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    const headers = getHeaders();

    Promise.all([
      fetch(`${API_URL}/api/projects/${projectId}`, { headers }).then(res => {
        if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
        return res.json();
      }),
      fetch(`${API_URL}/api/phases/project/${projectId}`, { headers }).then(res => res.json()),
      fetch(`${API_URL}/api/projects/${projectId}/timeline-photos`, { headers }).then(res => res.ok ? res.json() : [])
    ])
      .then(([projectData, phaseData, photoData]) => {
        setProject(projectData);
        setPhases(Array.isArray(phaseData) ? phaseData : []);
        setTimelinePhotos(Array.isArray(photoData) ? photoData : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [projectId]);

  if (loading) return <div className="loading">Loading project details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!project) return <div className="error">Project not found</div>;

  // Group photos by phase for inline display
  const photosByPhase = {};
  timelinePhotos.forEach(p => {
    if (p.phase_id) {
      if (!photosByPhase[p.phase_id]) photosByPhase[p.phase_id] = [];
      photosByPhase[p.phase_id].push(p);
    }
  });

  // Calculate costs
  const totalBudget = parseFloat(project.estimated_budget || 0);
  const costPerPhase = phases.length > 0 ? totalBudget / phases.length : 0;
  const completedPhases = phases.filter(p => p.status === 'completed');
  const completedCost = completedPhases.length * costPerPhase;
  const currentPhase = phases.find(p => p.status === 'in-progress') || phases[phases.length - 1];
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase?.id);
  const cumulativeCostBefore = currentPhaseIndex * costPerPhase;

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
          <h3>Completed</h3>
          <p className="info-value completed-count">{completedPhases.length} of {phases.length}</p>
          <p className="info-subtitle completed-cost">${completedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="info-card">
          <h3>Estimated Completion</h3>
          <p className="info-value completion-date">
            {project.end_date 
              ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (phases.length > 0 && project.start_date
                ? (() => {
                    const startDate = new Date(project.start_date);
                    const lastPhase = phases[phases.length - 1];
                    const estimatedDays = lastPhase.planned_start_day + (lastPhase.planned_duration_days || 0) - 1;
                    const completionDate = new Date(startDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
                    return completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  })()
                : 'TBD')}
          </p>
          <p className="info-subtitle">Projected Date</p>
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
                <p className="phase-cost">${costPerPhase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <PhasePhotos photos={photosByPhase[phase.id]} onView={setLightboxPhoto} />
              </div>
              <div className="phase-status">{phase.status || 'planned'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Upload & Gallery Section */}
      <TimelinePhotos projectId={projectId} phases={phases} />

      <div className="customer-footer">
        <p>Questions? Contact HP Home Improvements</p>
        <p>📞 (404) 931-3686 | greg@hphomeimprovements.com</p>
      </div>

      <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
}

export default CustomerView;
