import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Rating from "./Rating";
import Message from "../../components/Message";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import ProductTabs from "./Tabs";
import HeartIcon from "./HeartIcon";

const Product = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <div>
        <Link className="go-back-link" to="/">
          Go Back
        </Link>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className="product-container">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              <HeartIcon product={product} />
            </div>
            <div className="product-details">
              <h2 className="product-title">{product.name}</h2>

              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>

              <div className="product-info">
                <div className="product-info-left">
                  <h1 className="product-info-item">
                    <FaStore className="icon" /> Brand: {product.brand}
                  </h1>
                  <h1 className="product-info-item">
                    <FaClock className="icon" /> Added:{" "}
                    {moment(product.createdAt).fromNow()}
                  </h1>
                  <h1 className="product-info-item">
                    <FaStar className="icon" /> Reviews: {product.numReviews}
                  </h1>
                </div>

                <div className="product-info-right">
                  <h1 className="product-info-item">
                    <FaStar className="icon" /> Ratings: {rating}
                  </h1>
                  <h1 className="product-info-item">
                    <FaShoppingCart className="icon" /> Quantity:{" "}
                    {product.quantity}
                  </h1>
                  <h1 className="product-info-item">
                    <FaBox className="icon" /> In Stock: {product.stock}
                  </h1>
                </div>
              </div>

              <div className="rating-quantity">
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                />

                {product.stock > 0 && (
                  <div className="quantity-selector">
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="quantity-dropdown"
                    >
                      {[...Array(product.stock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="add-to-cart-btn-container">
                <button
                  onClick={addToCartHandler}
                  disabled={product.stock === 0}
                  className="add-to-cart-btn"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>

          <div className="product-tabs-container">
            <ProductTabs
              loadingProductReview={loadingProductReview}
              userInfo={userInfo}
              submitHandler={submitHandler}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              product={product}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Product;
