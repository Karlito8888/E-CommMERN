import { useGetTopProductsQuery } from "../redux/features/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";
import Message from "./Message";

const Podium = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">
        Une erreur est survenue lors du chargement des produits les mieux notés.
      </Message>
    );
  }

  const topProducts = data?.data || [];

  if (!topProducts.length) {
    return <Message variant="info">Aucun produit top n'est disponible pour le moment.</Message>;
  }

  return (
    <div className="podium-container">
      <h2 className="text-2xl font-bold mb-4">Nos Meilleurs Produits</h2>
      <div className="products-grid">
        {topProducts.map((product, index) => (
          <div key={product._id} className="product-item">
            <div className="rank-badge">#{index + 1}</div>
            <SmallProduct product={product} />
            <div className="product-rating">
              Note: {product.rating}/5 ({product.numReviews} avis)
            </div>
          </div>
        ))}
      </div>
      <ProductCarousel />
    </div>
  );
};

export default Podium;
