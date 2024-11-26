import { useSelector } from "react-redux";
import { selectFavoriteProducts } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";
import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Favorites = () => {
  // Récupération des produits favoris depuis le store Redux
  const favoris = useSelector(selectFavoriteProducts);

  return (
    <div className="favoris-container">
      <h2 className="favoris-title">Mes Produits Favoris</h2>

      {favoris.length > 0 ? (
        <div className="favoris-list">
          {/* Affichage de chaque produit favori */}
          {favoris.map((produit) => (
            <div key={produit._id} className="product-card">
              <Link to={`/product/${produit._id}`} className="product-link">
                <div className="product-image">
                  <img src={produit.image} alt={produit.name} />
                </div>
                <div className="product-details">
                  <h3>{produit.name}</h3>
                  <p className="price">{produit.price.toFixed(2)}€</p>
                </div>
              </Link>
              <HeartIcon product={produit} size="small" />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-favorites">
          <h3>Aucun produit favori</h3>
          <p>Explorez notre catalogue et ajoutez des produits à vos favoris !</p>
          <Link to="/shop" className="browse-products-btn">
            Découvrir nos produits
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
