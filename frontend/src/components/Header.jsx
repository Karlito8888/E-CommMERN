import { useGetTopProductsQuery } from "../redux/features/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";
import Message from "./Message";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">
        Une erreur est survenue lors du chargement des produits.
      </Message>
    ); // Utilisation du composant Message pour les erreurs
  }

  // Vérification que data est bien un objet et contient la clé `data` qui est un tableau
  if (!data || !Array.isArray(data.data)) {
    console.error("Unexpected data format", data);
    return <Message variant="danger">Format de données inattendu.</Message>; // Message d'erreur si les données ne sont pas au format attendu
  }

  return (
    <div className="header-container">
      <div className="products-grid">
        {data.data.slice(0, 3).map(
          (
            product // Limite le nombre de produits affichés à 3
          ) => (
            <div key={product._id} className="product-item">
              <SmallProduct product={product} />
            </div>
          )
        )}
      </div>
      <ProductCarousel />
    </div>
  );
};

export default Header;
