import React, { useState, useEffect } from 'react';

function Inspirations() {
  const [category, setCategory] = useState('kitchens');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = [
    { slug: 'kitchens', label: 'Kitchens' },
    { slug: 'deck', label: 'Deck' },
    { slug: 'bathroom', label: 'Bathroom' },
    { slug: 'fireplace', label: 'Fireplace' },
    { slug: 'basements', label: 'Basements' },
    { slug: 'drywall', label: 'Drywall' },
    { slug: 'beams', label: 'Beams' },
    { slug: 'flooring', label: 'Flooring' },
    { slug: 'new-builds', label: 'New Builds' }
  ];

  useEffect(() => {
    fetchImages(category);
  }, [category]);

  const fetchImages = async (cat) => {
    setLoading(true);
    setCurrentIndex(0);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/api/inspirations/${cat}`);
      const data = await res.json();
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="inspirations-page">
        <h2>Inspirations Gallery</h2>
        <div className="category-selector">
          <label>Category: </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="no-images">
          {loading ? 'Loading...' : 'No images found for this category.'}
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="inspirations-page">
      <h2>Inspirations Gallery</h2>
      
      <div className="category-selector">
        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="carousel-container">
        <button className="carousel-btn prev-btn" onClick={prevImage}>❮</button>
        
        <div className="carousel-image-wrapper">
          <img 
            src={currentImage.url || currentImage} 
            alt={`Inspiration ${currentIndex + 1}`}
            className="carousel-image"
          />
        </div>
        
        <button className="carousel-btn next-btn" onClick={nextImage}>❯</button>
      </div>

      <div className="carousel-info">
        <p>{currentIndex + 1} of {images.length}</p>
        {currentImage.name && <p className="image-name">{currentImage.name}</p>}
      </div>

      <div className="carousel-dots">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      <style jsx>{`
        .inspirations-page {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2rem;
          color: #333;
        }

        .category-selector {
          text-align: center;
          margin-bottom: 30px;
        }

        .category-selector select {
          padding: 10px 15px;
          font-size: 1rem;
          border: 2px solid #007bff;
          border-radius: 5px;
          cursor: pointer;
        }

        .carousel-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .carousel-image-wrapper {
          width: 100%;
          max-width: 800px;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carousel-btn {
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          padding: 10px 15px;
          font-size: 1.5rem;
          cursor: pointer;
          border-radius: 5px;
          transition: background 0.3s;
        }

        .carousel-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .carousel-info {
          text-align: center;
          margin-bottom: 20px;
        }

        .carousel-info p {
          margin: 5px 0;
          color: #666;
          font-size: 1rem;
        }

        .image-name {
          font-weight: bold;
          color: #333;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #007bff;
          background: white;
          cursor: pointer;
          transition: background 0.3s;
        }

        .dot.active {
          background: #007bff;
        }

        .no-images {
          text-align: center;
          padding: 60px 20px;
          color: #999;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}

export default Inspirations;
