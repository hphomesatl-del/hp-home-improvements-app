import React, { useState, useEffect } from 'react';
import '../styles/Portfolio.css';

function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load photos from the public/sample-photos folder
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // These are the actual downloaded photos
      const photoFiles = [
        'kitchen_1', 'kitchen_2', 'kitchen_3', 'kitchen_4', 'kitchen_5',
        'kitchen_6', 'kitchen_7', 'kitchen_8', 'kitchen_9', 'kitchen_10',
        'kitchen_11', 'kitchen_12', 'kitchen_13', 'kitchen_14', 'kitchen_15',
        'kitchen_16', 'kitchen_17', 'kitchen_18', 'kitchen_19', 'kitchen_20'
      ];

      const photos = photoFiles.map((file, index) => ({
        id: index + 1,
        src: `/sample-photos/${file}.jpg`,
        caption: `Kitchen Project ${index + 1}`,
        alt: `Kitchen renovation photo ${index + 1}`
      }));

      setPhotos(photos);
      setLoading(false);
    } catch (error) {
      console.error('Error loading photos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>Before & After Gallery</h1>
        <p>See our completed kitchen renovation projects</p>
        {photos.length > 0 && (
          <p className="photo-count">📸 {photos.length} photos</p>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="empty-gallery">
          <h2>Gallery Coming Soon</h2>
          <p>No photos available yet</p>
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
