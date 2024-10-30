import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";
import "./Header.scss";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <div className="header-container">
      <div className="products-grid">
        {data.map((product) => (
          <div key={product._id} className="product-item">
            <SmallProduct product={product} />
          </div>
        ))}
      </div>
      <ProductCarousel />
    </div>
  );
};

export default Header;
