import { useSelector } from "react-redux";
import { selectFavoritesCount } from "../../redux/features/favorites/favoriteSlice";
import { memo } from "react";
import { FaHeart } from "react-icons/fa";

const FavoritesCount = ({ 
  className = "", 
  showIcon = true, 
  showZero = false,
  asLink = false 
}) => {
  const count = useSelector(selectFavoritesCount);
  const shouldDisplay = showZero || count > 0;

  if (!shouldDisplay) return null;

  const content = (
    <>
      {showIcon && <FaHeart className="favorites-icon" />}
      <span className="favorites-count">{count}</span>
    </>
  );

  if (asLink) {
    return (
      <Link 
        to="/favorites" 
        className={`favorites-count-container ${className}`}
        aria-label={`${count} produit${count > 1 ? 's' : ''} en favoris`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`favorites-count-container ${className}`}>
      {content}
    </div>
  );
};

export default memo(FavoritesCount);
