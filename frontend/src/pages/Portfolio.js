import React, { useState, useEffect } from 'react';
import '../styles/Portfolio.css';

function Portfolio() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [kitchenPhotos, setKitchenPhotos] = useState([]);
  const [deckPhotos, setDeckPhotos] = useState([]);

  useEffect(() => {
    // Load kitchen photos
    const kitchens = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      src: `/sample-photos/kitchen_${i + 1}.jpg`,
      type: 'kitchen'
    }));
    setKitchenPhotos(kitchens);

    // Load deck photos (if they exist)
    const decks = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      src: `/sample-photos/deck_${i + 1}.jpg`,
      type: 'deck'
    }));
    setDeckPhotos(decks);
  }, []);

  // Shuffle array for random rotation
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const renderGallerySection = (photos, title, description) => {
    if (photos.length === 0) return null;

    // Shuffle and display up to 20 photos
    const displayPhotos = shuffleArray(photos).slice(0, 20);

    return (
      <div key={title} className="gallery-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p className="section-description">{description}</p>
          <p className="photo-count">📸 {displayPhotos.length} photos from Google Drive</p>
        </div>

        <div className="gallery-grid">
          {displayPhotos.map((photo) => (
            <div 
              key={`${photo.type}-${photo.id}`}
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.src} 
                alt={`${title} ${photo.id}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <p className="photo-caption">{title} {photo.id}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>Before & After Gallery</h1>
        <p>See our completed projects from HP Home Improvements</p>
      </div>

      {renderGallerySection(
        kitchenPhotos,
        'Kitchens',
        'Beautiful kitchen renovations and remodels. Photos sourced directly from Google Drive.'
      )}

      {renderGallerySection(
        deckPhotos,
        'Decks',
        'Custom deck builds and outdoor improvements. Photos sourced directly from Google Drive.'
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
            <img src={selectedPhoto.src} alt={`${selectedPhoto.type} ${selectedPhoto.id}`} />
            <p>{selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1)} Project {selectedPhoto.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
