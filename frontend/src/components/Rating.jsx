import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, className = '' }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= value) {
      // Étoile pleine
      stars.push(<FaStar key={i} className="star filled" />);
    } else if (i - 0.5 <= value) {
      // Demi-étoile
      stars.push(<FaStarHalfAlt key={i} className="star half" />);
    } else {
      // Étoile vide
      stars.push(<FaRegStar key={i} className="star empty" />);
    }
  }

  return (
    <div className={`rating ${className}`}>
      {stars}
    </div>
  );
};

export default Rating;
