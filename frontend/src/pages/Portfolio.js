import React, { useState, useEffect } from 'react';
import '../styles/Portfolio.css';

function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load photos from the public/sample-photos folder
    // This uses webpack's require.context to load all images
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // Fetch list of files from public folder
      // Since we're loading from /public/sample-photos, they'll be accessible at /sample-photos/
      const photoFiles = [
        'IMG_0439.jpg', 'IMG_0436.jpg', 'IMG_2182.jpg', 'IMG_0438.jpg', 'IMG_9918.jpg',
        'IMG_7514.jpg', 'IMG_0435.jpg', 'IMG_0415.jpg', 'IMG_0440.jpg', 'IMG_0414.jpg',
        'IMG_0360.jpg', 'IMG_6846.jpg', 'IMG_6066.jpg', 'IMG_4206.jpg', 'IMG_7647.jpg',
        'IMG_7151.jpg', 'IMG_5433.jpg', 'IMG_4274.jpg', 'IMG_9336.jpg', 'IMG_9799.jpg',
        'IMG_0511.jpg', 'IMG_9596.jpg', 'IMG_9595.jpg', 'IMG_9594.jpg', 'IMG_6509.jpg',
        'IMG_6510.jpg', 'IMG_9591.jpg', 'IMG_7570.jpg', 'IMG_3825.jpg', 'IMG_5936.jpg',
        'IMG_7317.jpg', 'IMG_5064.jpg', '73998597596__DFDE6BFF-3658-459B-818E-8EB5A1DBAF25.jpg',
        'IMG_1716.jpg', '73998603876__F11B8383-A18F-44AA-91DB-2CFF17806659.jpg', 'IMG_4370.jpg',
        'IMG_4204.jpg', 'IMG_0314.jpg', '13A349F6-54A5-47C0-96D9-8C07B1607000.jpg',
        '31FC4F0D-3171-49C1-A420-16BBBC68047B.jpg', 'IMG_3887.jpg', 'IMG_2957.jpg', 'IMG_1846.jpg',
        'IMG_1845.jpg', 'IMG_1841.jpg', 'IMG_1732.jpg', 'IMG_1554.jpg', 'IMG_1545.jpg',
        'IMG_1085.jpg', 'IMG_1500.jpg'
      ];

      const photos = photoFiles.map((file, index) => ({
        id: index + 1,
        src: `/sample-photos/${file}`,
        caption: file.replace('.jpg', '').replace('_', ' '),
        alt: `Kitchen photo ${index + 1}`
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
