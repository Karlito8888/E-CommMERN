const Rating = ({ value, className = "", size = "" }) => {
  const numericValue = Number(value);
  const stars = [];

  for (let i = 0; i < 5; i++) {
    const percent = Math.max(0, Math.min(100, (numericValue - i) * 100));
    
    stars.push(
      <div key={i} className="star-container">
        <svg
          viewBox="0 0 24 24"
          className="star-svg"
        >
          {/* Étoile de fond (grise) */}
          <path
            className="star-background"
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#e0e0e0"
          />
          {/* Étoile remplie avec un clip-path */}
          <path
            className="star-filled"
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#ffc107"
            style={{
              clipPath: `inset(0 ${100 - percent}% 0 0)`
            }}
          />
        </svg>
      </div>
    );
  }

  const ratingClass = `rating ${size ? `rating-${size}` : ''} ${className}`.trim();
  return <div className={ratingClass}>{stars}</div>;
};

export default Rating;
