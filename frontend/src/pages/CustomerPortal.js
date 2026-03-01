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
  const [weather, setWeather] = useState(null);
  const [weatherTomorrow, setWeatherTomorrow] = useState(null);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    setUser(userData ? JSON.parse(userData) : null);
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

  // Fetch weather for Georgia (Today + Tomorrow)
  useEffect(() => {
    fetch('https://api.weather.gov/points/33.8,-84.4')
      .then(res => res.json())
      .then(data => {
        if (data.properties?.forecast) {
          return fetch(data.properties.forecast);
        }
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.properties?.periods?.length >= 2) {
          setWeather(data.properties.periods[0]);
          setWeatherTomorrow(data.properties.periods[1]);
        } else if (data?.properties?.periods?.length > 0) {
          setWeather(data.properties.periods[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="portal-header-right">
          <div className="time-weather">
            <div className="time-display">
              🕐 {time.toLocaleTimeString()}
            </div>
            {weather && (
              <div className="weather-section">
                <div className="weather-display">
                  <strong>Today:</strong> {weather.temperature}°F • {weather.shortForecast}
                </div>
                {weatherTomorrow && (
                  <div className="weather-display tomorrow">
                    <strong>Tomorrow:</strong> {weatherTomorrow.temperature}°F • {weatherTomorrow.shortForecast}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="btn logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
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
          className={`portal-tab ${activeTab === 'pictures' ? 'active' : ''}`}
          onClick={() => setActiveTab('pictures')}
        >
          📸 Project Pictures
        </button>
        <button
          className={`portal-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Plans & Appliances
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
        {activeTab === 'pictures' && <ProjectPicturesTab projects={projects} />}
        {activeTab === 'documents' && <ProjectDocumentsTab projects={projects} user={user} />}
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
  // Full HP Home Improvements team
  const hpTeam = [
    {
      id: 'greg',
      name: 'Greg Hutzell',
      trade: 'Owner & General Contractor',
      company: 'HP Home Improvements',
      phone: null,
      email: null
    },
    {
      id: 'carolyn',
      name: 'Carolyn Perry',
      trade: 'Bookkeeping',
      company: 'HP Home Improvements',
      phone: '(470) 617-3820',
      email: null
    },
    {
      id: 'nick',
      name: 'Nick Stipetich',
      trade: 'Project Management',
      company: 'HP Home Improvements',
      phone: '(470) 617-3810',
      email: null
    },
    {
      id: 'fidel',
      name: 'Fidel Espinal',
      trade: 'Lead Carpenter',
      company: 'HP Home Improvements',
      phone: null,
      email: null
    },
    {
      id: 'jose',
      name: 'Jose Montdragon',
      trade: 'Painting',
      company: 'HP Home Improvements',
      phone: null,
      email: null
    },
    {
      id: 'hector',
      name: 'Hector Gonzales',
      trade: 'Plumbing & HVAC',
      company: 'G & P Plumbing and HVAC',
      phone: null,
      email: null
    },
    {
      id: 'axel',
      name: 'Axel Sorzano',
      trade: 'Electrical',
      company: 'Amen Electric',
      phone: null,
      email: null
    },
    {
      id: 'andres',
      name: 'Andres',
      trade: 'Tile & Stone',
      company: 'HP Home Improvements',
      phone: null,
      email: null
    },
    {
      id: 'jorge',
      name: 'Jorge',
      trade: 'Drywall Finishing',
      company: 'HP Home Improvements',
      phone: null,
      email: null
    },
    {
      id: 'luciano',
      name: 'Luciano Martinez',
      trade: 'Flooring',
      company: 'Fast Flooring & Carpeting',
      phone: null,
      email: null
    },
    {
      id: 'teresa',
      name: 'Teresa Hamilton',
      trade: 'Design',
      company: 'TLHD',
      phone: '(678) 571-7533',
      email: null
    },
    {
      id: 'daniel',
      name: 'Daniel Wheeler',
      trade: 'Cabinets & Woodwork',
      company: 'Wheeler Woodworks',
      phone: '(770) 307-1684',
      email: null
    }
  ];

  return (
    <div className="team-grid">
      {hpTeam.map(member => (
        <div key={member.id} className="team-card">
          <div className="team-card-header">
            <h3>{member.name}</h3>
            <span className="trade-badge">{member.trade}</span>
          </div>
          {member.company && <p className="team-company">{member.company}</p>}
          <div className="team-contact">
            {member.phone && <p>📞 {member.phone}</p>}
            {member.email && <p>✉️ {member.email}</p>}
            {!member.phone && !member.email && <p className="team-contact-note">Available through main office</p>}
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
  const [selectedImage, setSelectedImage] = useState(null);

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
      <p className="inspirations-intro">Browse our inspiration gallery for your next project!</p>
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
                <div key={img.id} className="gallery-item" onClick={() => setSelectedImage(img)} style={{ cursor: 'pointer' }}>
                  <img src={img.url} alt={img.name} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage.url} alt={selectedImage.name} />
            {selectedImage.name && <p className="lightbox-name">{selectedImage.name}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectPicturesTab({ projects }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const projectId = projects.length > 0 ? projects[0].id : null;

  const headers = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
  };

  const loadPhotos = () => {
    if (!projectId) return;
    setLoading(true);
    fetch(`${API_URL}/api/projects/${projectId}/pictures`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setPhotos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadPhotos(); }, [projectId]);

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('photos', files[i]);
    fetch(`${API_URL}/api/projects/${projectId}/pictures`, {
      method: 'POST', headers: headers(), body: formData
    })
      .then(r => r.json())
      .then(() => { loadPhotos(); setUploading(false); e.target.value = ''; })
      .catch(() => setUploading(false));
  };

  const handleDelete = (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    fetch(`${API_URL}/api/projects/${projectId}/pictures/${photoId}`, {
      method: 'DELETE', headers: headers()
    }).then(() => loadPhotos());
  };

  if (!projectId) return <div className="no-projects"><h2>No Project Found</h2></div>;

  return (
    <div className="project-pictures-section">
      <div className="upload-area">
        <label className="upload-btn">
          {uploading ? '⏳ Uploading...' : '📸 Upload Photos'}
          <input type="file" multiple accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic"
            onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
        </label>
        <span className="upload-hint">JPG, PNG, or HEIC • Up to 15MB each</span>
      </div>
      {loading ? <div className="loading">Loading photos...</div> : photos.length === 0 ? (
        <div className="no-projects"><p>No project pictures uploaded yet. Tap the button above to add photos!</p></div>
      ) : (
        <div className="gallery-grid">
          {photos.map(p => (
            <div key={p.id} className="gallery-item picture-item">
              <img
                src={p.thumbnail_path ? `${API_URL}/uploads/project-pictures/thumbs/${p.thumbnail_path}` : `${API_URL}/uploads/project-pictures/${p.file_path}`}
                alt={p.file_name} loading="lazy"
                onClick={() => setSelectedPhoto(p)}
              />
              <div className="picture-meta">
                <span className="picture-date">{new Date(p.uploaded_at).toLocaleDateString()} {new Date(p.uploaded_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                <button className="delete-btn-small" onClick={() => handleDelete(p.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>✕</button>
            <img src={`${API_URL}/uploads/project-pictures/${selectedPhoto.file_path}`} alt={selectedPhoto.file_name} />
            <p className="lightbox-name">{selectedPhoto.file_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDocumentsTab({ projects, user }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const projectId = projects.length > 0 ? projects[0].id : null;
  const isOwner = user?.role === 'admin';

  const headers = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
  };

  const loadDocs = () => {
    if (!projectId) return;
    setLoading(true);
    fetch(`${API_URL}/api/projects/${projectId}/documents`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setDocs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadDocs(); }, [projectId]);

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('document', files[i]);
    fetch(`${API_URL}/api/projects/${projectId}/documents`, {
      method: 'POST', headers: headers(), body: formData
    })
      .then(r => r.json())
      .then(() => { loadDocs(); setUploading(false); e.target.value = ''; })
      .catch(() => setUploading(false));
  };

  const handleDelete = (docId) => {
    if (!window.confirm('Delete this document?')) return;
    fetch(`${API_URL}/api/projects/${projectId}/documents/${docId}`, {
      method: 'DELETE', headers: headers()
    }).then(() => loadDocs());
  };

  const handleDownload = (doc) => {
    const link = document.createElement('a');
    link.href = `${API_URL}/uploads/project-documents/${doc.file_path}`;
    link.download = doc.file_name;
    link.click();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!projectId) return <div className="no-projects"><h2>No Project Found</h2></div>;

  return (
    <div className="project-documents-section">
      <div className="upload-area">
        <label className="upload-btn">
          {uploading ? '⏳ Uploading...' : '📄 Upload Plans & Specs'}
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" onChange={handleUpload} disabled={uploading} multiple style={{ display: 'none' }} />
        </label>
        <span className="upload-hint">PDF, Word, Excel, or Images • Up to 50MB each</span>
      </div>
      {loading ? <div className="loading">Loading documents...</div> : docs.length === 0 ? (
        <div className="no-projects"><p>No plans or appliance documents uploaded yet. Upload floor plans, appliance specs, and project details here.</p></div>
      ) : (
        <div className="documents-list">
          {docs.map(d => (
            <div key={d.id} className="document-item">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <p className="document-name" onClick={() => handleDownload(d)} style={{cursor: 'pointer'}}>
                  📥 {d.file_name}
                </p>
                <span className="document-meta">{formatSize(d.file_size)} • {new Date(d.uploaded_at).toLocaleDateString()}</span>
              </div>
              <div className="document-actions">
                <button className="download-btn" onClick={() => handleDownload(d)} title="Download">⬇️</button>
                {isOwner && (
                  <button className="delete-btn-small" onClick={() => handleDelete(d.id)} title="Delete (Owner only)">🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerPortal;
