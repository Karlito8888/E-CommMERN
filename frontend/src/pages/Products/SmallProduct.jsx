import { Link } from "react-router-dom";
import Rating from "../../components/Rating";
import ValidatedImage from "../../components/ValidatedImage";
import { useState } from "react";

const SmallProduct = ({ product }) => {
  const [isImageValid, setIsImageValid] = useState(true);

  if (!isImageValid) return null;

  return (
    <Link to={`/product/${product._id}`} className="small-product">
      <div className="product-image">
        <ValidatedImage 
          src={product.image} 
          alt={product.name} 
          onValidation={setIsImageValid}
        />
      </div>

      <div className="product-info">
        <h2 className="product-header">
          <div>{product.name}</div>
          <span className="product-price">{product.price.toFixed(2)}€</span>
        </h2>
        <div className="product-stats">
          <div className="rating-container">
            <Rating value={product.rating} className="product-rating" />
            <span className="rating-value">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
          <div className="reviews-count">
            {product.numReviews} {product.numReviews > 1 ? "avis" : "avis"}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SmallProduct;
