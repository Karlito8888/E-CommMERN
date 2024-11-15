import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Podium from "../components/Podium";
import Product from "./Products/Product";
import { useGetProductsQuery } from "../redux/features/productApiSlice";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  
  // Accéder aux produits via data.data au lieu de data.products
  const products = data?.data.products || [];

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
    <>
      {!keyword ? <Podium /> : null}
      <div className="home-container">
        <h1 className="home-title">Produits Spéciaux</h1>

        <Link to="/shop" className="shop-button">
          Boutique
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
          <Message variant="warning">Aucun produit trouvé</Message>
        )}
      </div>
    </>
  );
};

export default Home;
