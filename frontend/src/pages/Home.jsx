import { useParams } from "react-router-dom";
import Message from "../components/Message";
import Podium from "../components/Podium";
import Product from "./Products/Product";
import { useGetProductsQuery } from "../redux/features/productApiSlice";
import ProductCarousel from "./Products/ProductCarousel";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });
  const products = data?.products || [];

  if (isError) {
    return (
      <Message variant="danger">
        {isError?.data?.message || isError?.error || "Une erreur est survenue"}
      </Message>
    );
  }

  return (
    <div className="home-container">
      {!keyword && (
        <>
          <Podium />
          <div className="carousel-section">
            <ProductCarousel />
          </div>
        </>
      )}
      
      <div className="products-section">
        <h2>{keyword ? `Résultats pour "${keyword}"` : "Tous nos produits"}</h2>
        {isLoading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="product-skeleton"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <Message variant="warning">Aucun produit trouvé</Message>
        )}
      </div>
    </div>
  );
};

export default Home;
