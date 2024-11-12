import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Header from "../components/Header";
import Product from "./Products/Product";
import { useGetProductsQuery } from "../redux/features/productApiSlice";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });
  const products = data?.products || []; // Accès aux produits

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Message variant="danger">
        {isError?.data?.message || isError?.error || "An error occurred"}
      </Message>
    );
  }

  // Vérification du format des données
  if (!Array.isArray(products)) {
    console.error("Unexpected data format", products);
    return <Message variant="danger">Unexpected data format</Message>;
  }

  return (
    <>
      {!keyword ? <Header data={data} /> : null}
      <div className="home-container">
        <h1 className="home-title">Special Products</h1>

        <Link to="/shop" className="shop-button">
          Shop
        </Link>
      </div>
      <div className="products-container">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id}>
              <Product product={product} />
            </div>
          ))
        ) : (
          <Message variant="warning">No products found</Message>
        )}
      </div>
    </>
  );
};

export default Home;
