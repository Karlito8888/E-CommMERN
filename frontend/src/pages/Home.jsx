import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Podium from "../components/Podium";
import Product from "./Products/Product";
import { useGetProductsQuery } from "../redux/features/productApiSlice";
import ProductCarousel from "./Products/ProductCarousel";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  // Access the products array from the paginated response
  const products = data?.products || [];
  console.log("products", products);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Message variant="danger">
        {isError?.data?.message || isError?.error || "Une erreur est survenue"}
      </Message>
    );
  }

  return (
      <div className="home-container">
        {!keyword ? <Podium /> : null}
        <div className="carousel-section">
          <ProductCarousel />
        </div>
        <div className="products-container">
          {products.length > 0 ? (
            products.map((product) => (
              <Product key={product._id} product={product} />
            ))
          ) : (
            <Message variant="warning">Aucun produit trouvé</Message>
          )}
        </div>
      </div>
  );
};

export default Home;
