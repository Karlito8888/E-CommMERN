import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Message from "../../components/Message";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
// import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { useCreateReviewMutation, useGetProductByIdQuery } from "../../redux/features/productApiSlice";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductByIdQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Critique créée avec succès");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  return (
    <>
      <div>
        <Link to="/" className="btn-back">
          Retourner
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          <div className="product-details">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />

              <HeartIcon product={product} />
            </div>

            <div className="product-info">
              <h2 className="product-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>

              <p className="product-price">€ {product.price}</p>

              <div className="product-meta">
                <div className="brand-info">
                  <h1 className="brand">
                    <FaStore className="icon" /> Marque: {product.brand}
                  </h1>
                  <h1 className="added">
                    <FaClock className="icon" /> Ajouté:{" "}
                    {moment(product.createAt).fromNow()}
                  </h1>
                  <h1 className="reviews">
                    <FaStar className="icon" /> Avis: {product.numReviews}
                  </h1>
                </div>

                <div className="rating-info">
                  <h1 className="ratings">
                    <FaStar className="icon" /> Évaluations: {rating}
                  </h1>
                  <h1 className="quantity">
                    <FaShoppingCart className="icon" /> Quantité:{" "}
                    {product.quantity}
                  </h1>
                  <h1 className="stock">
                    <FaBox className="icon" /> En Stock: {product.stock}
                  </h1>
                </div>
              </div>

              <div className="quantity-selector">
                {/* <Ratings
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                /> */}

                {product.stock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="qty-select"
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

              <div className="btn-container">
                <button
                  onClick={addToCartHandler}
                  disabled={product.stock === 0}
                  className="btn-add-to-cart"
                >
                  Ajouter au Panier
                </button>
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
          </div>
        </>
      )}
    </>
  );
};

export default ProductDetails;