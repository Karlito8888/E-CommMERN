import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const SmallProduct = ({ product }) => {
  return (
    <div className="small-product">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <HeartIcon product={product} />
      </div>

      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h2 className="product-header">
            <div>{product.name}</div>
            <span className="product-price">${product.price}</span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default SmallProduct;
