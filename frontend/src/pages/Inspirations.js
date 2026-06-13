import React, { useState, useEffect, useCallback } from 'react';

function Inspirations() {
  const [category, setCategory] = useState('Kitchens');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState({});

  const categories = [
    { slug: 'New Builds', label: 'New Builds' },
    { slug: 'Kitchens', label: 'Kitchens' },
    { slug: 'Flooring', label: 'Flooring' },
    { slug: 'Fireplaces', label: 'Fireplaces' },
    { slug: 'Drywall', label: 'Drywall' },
    { slug: 'Decks', label: 'Decks' },
    { slug: 'Closets', label: 'Closets' },
    { slug: 'Beams', label: 'Beams' },
    { slug: 'Bathrooms', label: 'Bathrooms' },
    { slug: 'Basements', label: 'Basements' }
  ];

  const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '').replace(/\/$/, '');

  const assetUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    // Fetch first image from each category to use as real thumbnail
    const fetchThumbnails = async () => {
      const thumbs = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(`${apiUrl}/api/inspirations/category/${cat.slug}`);
            const data = await res.json();
            if (data.inspirations && data.inspirations.length > 0) {
              thumbs[cat.slug] = assetUrl(data.inspirations[0].thumbnail_url || data.inspirations[0].image_url || data.inspirations[0]);
            }
          } catch (err) {
            console.error(`Error fetching thumbnail for ${cat.slug}:`, err);
          }
        })
      );
      setThumbnails(thumbs);
    };
    fetchThumbnails();
  }, [apiUrl]);

  const fetchImages = useCallback(async (cat) => {
    setLoading(true);
    setCurrentIndex(0);
    try {
      const res = await fetch(`${apiUrl}/api/inspirations/category/${cat}`);
      const data = await res.json();
      if (data.inspirations && Array.isArray(data.inspirations)) {
        setImages(data.inspirations);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setImages([]);
    }
    setLoading(false);
  }, [apiUrl]);

  useEffect(() => {
    fetchImages(category);
  }, [category, fetchImages]);

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

  const currentImage = images.length > 0 ? images[currentIndex] : null;

  return (
    <div className="inspirations-page">
      <h2>Inspirations Gallery</h2>
      
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            className={`category-tab ${category === cat.slug ? 'active' : ''}`}
            onClick={() => setCategory(cat.slug)}
          >
            <div className="tab-thumb-wrapper">
              {thumbnails[cat.slug] ? (
                <img 
                  src={thumbnails[cat.slug]} 
                  alt={cat.label}
                  className="tab-thumbnail"
                  loading="lazy"
                />
              ) : (
                <div className="tab-thumb-placeholder" />
              )}
            </div>
            <span className="tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="no-images">Loading...</div>
      ) : !currentImage ? (
        <div className="no-images">No images found for this category.</div>
      ) : (
        <>
          <div className="carousel-container">
            <button className="carousel-btn prev-btn" onClick={prevImage}>❮</button>
            
            <div className="carousel-image-wrapper">
              <img 
                src={assetUrl(currentImage.image_url || currentImage.url || currentImage)} 
                alt={currentImage.title || `Inspiration ${currentIndex + 1}`}
                className="carousel-image"
              />
            </div>
            
            <button className="carousel-btn next-btn" onClick={nextImage}>❯</button>
          </div>

          <div className="carousel-info">
            <p>{currentIndex + 1} of {images.length}</p>
            {currentImage.title && <p className="image-name">{currentImage.title}</p>}
            {currentImage.description && <p className="image-desc">{currentImage.description}</p>}
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
        </>
      )}

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

        .category-tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-bottom: 36px;
          padding: 0 10px;
        }

        .category-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .category-tab:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.15);
        }

        .category-tab.active {
          border-color: #007bff;
          background: linear-gradient(135deg, #f0f7ff, #e6f0ff);
          box-shadow: 0 4px 16px rgba(0,123,255,0.2);
        }

        .tab-thumb-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .tab-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tab-thumb-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e8e8e8, #d0d0d0);
        }

        .tab-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #555;
          text-align: center;
          line-height: 1.2;
        }

        .category-tab.active .tab-label {
          color: #007bff;
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

        @media (max-width: 768px) {
          .category-tabs {
            gap: 8px;
          }
          .category-tab {
            width: 80px;
            padding: 6px;
          }
          .tab-thumb-wrapper {
            width: 56px;
            height: 56px;
          }
          .tab-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Inspirations;
