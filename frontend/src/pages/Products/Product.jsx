import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} loading="lazy" />
        <HeartIcon product={product} />
      </div>

      <div className="product-details">
        <Link to={`/product/${product._id}`}>
          <h2 className="product-header">
            <div className="product-name">{product.name}</div>
            <span className="product-price">{product.price}€</span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
