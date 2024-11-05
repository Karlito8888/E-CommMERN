import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";

const Favoris = () => {
  // Récupération des produits favoris depuis le store Redux
  const favoris = useSelector(selectFavoriteProduct);

  return (
    <div className="favoris-container">
      <h1 className="favoris-title">PRODUITS FAVORIS</h1>

      <div className="favoris-list">
        {/* Affichage de chaque produit favori */}
        {favoris.map((produit) => (
          <Product key={produit._id} product={produit} />
        ))}
      </div>
    </div>
  );
};

export default Favoris;
