import React, { useState, useEffect } from 'react';
import '../styles/Portfolio.css';

function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    // In a real app, these would come from the API
    // For now, we'll load from the public folder
    // Files you add to /public/sample-photos will appear here
    
    const photoList = [
      // Example structure - add your Instagram photos here
      // { id: 1, src: '/sample-photos/photo1.jpg', caption: 'Kitchen Before', alt: 'Before photo' },
      // { id: 2, src: '/sample-photos/photo2.jpg', caption: 'Kitchen After', alt: 'After photo' },
    ];
    setPhotos(photoList);
  }, []);

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>Before & After Gallery</h1>
        <p>See our completed renovation projects</p>
      </div>

      {photos.length === 0 ? (
        <div className="empty-gallery">
          <h2>Gallery Coming Soon</h2>
          <p>
            📸 Add photos to: <code>/frontend/public/sample-photos/</code>
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Steps to add Instagram photos:
          </p>
          <ol style={{ textAlign: 'left', display: 'inline-block', color: '#666' }}>
            <li>Go to Instagram and find #hphomeimprovements posts</li>
            <li>Right-click the image → "Save image"</li>
            <li>Save to: <code>/frontend/public/sample-photos/</code></li>
            <li>Refresh this page to see them appear</li>
          </ol>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.src} alt={photo.alt} />
              <p className="photo-caption">{photo.caption}</p>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
            <p>{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
