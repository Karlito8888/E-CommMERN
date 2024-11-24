import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Message from "../../components/Message";
import { FaStore, FaStar, FaArrowLeft } from "react-icons/fa";
import HeartIcon from "./HeartIcon";
import Rating from "../../components/Rating";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  useCreateReviewMutation,
  useGetProductByIdQuery,
} from "../../redux/features/productApiSlice";

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

    if (!rating) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    if (!comment.trim()) {
      toast.error("Veuillez ajouter un commentaire");
      return;
    }

    try {
      await createReview({
        productId,
        rating,
        comment: comment.trim(),
        name: userInfo.username
      }).unwrap();
      
      // Réinitialiser le formulaire
      setRating(0);
      setComment("");
      
      refetch();
      toast.success("Avis ajouté avec succès");
    } catch (err) {
      // Gestion spécifique des erreurs HTTP
      if (err.data?.message === 'Produit déjà évalué') {
        toast.info("Vous avez déjà évalué ce produit");
      } else {
        toast.error(err?.data?.message || "Une erreur est survenue lors de l'ajout de l'avis");
      }
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  return (
    <>
      <div className="arrow-container">
        <Link
          to="/"
          className="btn-back"
          aria-label="Retourner à la page d'accueil"
        >
          <FaArrowLeft aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div aria-live="polite">Chargement en cours...</div>
      ) : error ? (
        <Message variant="danger" role="alert">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          <div className="product-details-container">
            <section className="image-container" aria-label="Images du produit">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              <HeartIcon product={product} />
            </section>

            <div className="product-infos-container">
              <section
                className="product-info"
                aria-label="Informations du produit"
              >
                  <h1 className="product-title">{product.name}</h1>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price" aria-label="Prix">
                    <span className="visually-hidden">{product.price}€</span>
                  </p>
              </section>

              <section
                className="product-meta"
                aria-label="Détails supplémentaires"
              >
                <dl className="brand-info">
                  <div>
                    <dt>
                      <FaStore className="icon" aria-hidden="true" />
                    </dt>
                    <dd>{product.brand}</dd>
                  </div>
                  <div>
                    <dt>
                      <FaStar className="icon" aria-hidden="true" />
                    </dt>
                    <dd>{product.numReviews} avis</dd>
                  </div>
                  <div>
                    <dd>
                      <Rating
                        value={product.rating}
                        className="product-rating"
                      />
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className="quantity-selector"
                aria-label="Sélection de la quantité"
              >
                {product.countInStock > 0 && (
                  <div className="select-wrapper">
                    <label htmlFor="quantity" className="form-label">
                      Sélectionner une quantité:
                    </label>
                    <select
                      id="quantity"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="qty-select"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="btn-add-to-cart"
                  aria-label={
                    product.countInStock === 0
                      ? "Produit indisponible"
                      : `Ajouter ${product.name} au panier`
                  }
                >
                  {product.countInStock === 0
                    ? "Produit indisponible"
                    : "Ajouter au Panier"}
                </button>
              </section>
            </div>
          </div>
          <div
            className="product-tabs-container"
            aria-label="Avis et commentaires"
          >
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

export default ProductDetails;
