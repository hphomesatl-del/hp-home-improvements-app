import React, { useState } from 'react';
import '../styles/Portfolio.css';

function Portfolio() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Just use simple absolute paths - React will serve from public folder
  const photos = [
    { id: 1, src: '/sample-photos/kitchen_1.jpg' },
    { id: 2, src: '/sample-photos/kitchen_2.jpg' },
    { id: 3, src: '/sample-photos/kitchen_3.jpg' },
    { id: 4, src: '/sample-photos/kitchen_4.jpg' },
    { id: 5, src: '/sample-photos/kitchen_5.jpg' },
    { id: 6, src: '/sample-photos/kitchen_6.jpg' },
    { id: 7, src: '/sample-photos/kitchen_7.jpg' },
    { id: 8, src: '/sample-photos/kitchen_8.jpg' },
    { id: 9, src: '/sample-photos/kitchen_9.jpg' },
    { id: 10, src: '/sample-photos/kitchen_10.jpg' },
    { id: 11, src: '/sample-photos/kitchen_11.jpg' },
    { id: 12, src: '/sample-photos/kitchen_12.jpg' },
    { id: 13, src: '/sample-photos/kitchen_13.jpg' },
    { id: 14, src: '/sample-photos/kitchen_14.jpg' },
    { id: 15, src: '/sample-photos/kitchen_15.jpg' },
    { id: 16, src: '/sample-photos/kitchen_16.jpg' },
    { id: 17, src: '/sample-photos/kitchen_17.jpg' },
    { id: 18, src: '/sample-photos/kitchen_18.jpg' },
    { id: 19, src: '/sample-photos/kitchen_19.jpg' },
    { id: 20, src: '/sample-photos/kitchen_20.jpg' },
  ];

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>Before & After Gallery</h1>
        <p>See our completed kitchen renovation projects</p>
        <p className="photo-count">📸 {photos.length} photos</p>
      </div>

      <div className="gallery-grid">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="gallery-item"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img 
              src={photo.src} 
              alt={`Kitchen renovation ${photo.id}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <p className="photo-caption">Kitchen Renovation {photo.id}</p>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <img src={selectedPhoto.src} alt={`Kitchen renovation ${selectedPhoto.id}`} />
            <p>Kitchen Renovation {selectedPhoto.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
