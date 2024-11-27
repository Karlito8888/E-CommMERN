import { Link } from "react-router-dom";
import Rating from "../../components/Rating";
import ValidatedImage from "../../components/ValidatedImage";
import HeartAndCart from "../../components/HeartAndCart";
import { useState } from "react";

const SmallProduct = ({ product }) => {
  const [isImageValid, setIsImageValid] = useState(true);

  if (!isImageValid) return null;

  return (
    <div className="small-product-container">
      <Link to={`/product/${product._id}`} className="small-product">
        <div className="product-image">
          <ValidatedImage
            src={product.image}
            alt={product.name}
            onValidation={setIsImageValid}
          />
          {product.brand && (
            <div className="brand-tag">
              {product.brand}
            </div>
          )}
        </div>
      </Link>
      <div className="small-cart-bottom">
        <HeartAndCart product={product} />
        <div className="product-info">
          <h3 className="product-header">
            <div>{product.name}</div>
            <span className="product-price">{product.price.toFixed(2)}€</span>
          </h3>
          <div className="product-stats">
            <div className="rating-container">
              <Rating value={Number(product.rating)} className="product-rating" />
              <span className="rating-value">
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
            <div className="reviews-count">
              {product.numReviews} {product.numReviews > 1 ? "avis" : "avis"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallProduct;
