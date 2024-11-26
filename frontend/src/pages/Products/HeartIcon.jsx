import { memo, useCallback, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { 
  toggleFavorite,
  selectIsFavorite,
  initializeFavorites
} from "../../redux/features/favorites/favoriteSlice";

const HeartIcon = ({ 
  product, 
  size = "medium",
  withAnimation = true,
  className = "" 
}) => {
  const dispatch = useDispatch();
  const isFavorite = useSelector(state => selectIsFavorite(state, product._id));

  useEffect(() => {
    dispatch(initializeFavorites());
  }, [dispatch]);

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(product));
  }, [dispatch, product]);

  return (
    <button
      type="button"
      className={`heart-icon ${size} ${withAnimation ? 'animated' : ''} ${className}`}
      onClick={handleToggleFavorite}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? (
        <FaHeart className="favorite" />
      ) : (
        <FaRegHeart className="not-favorite" />
      )}
    </button>
  );
};

export default memo(HeartIcon);
