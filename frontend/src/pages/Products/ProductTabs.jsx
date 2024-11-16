import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";
import { useGetTopRatedProductsQuery } from "../../redux/features/productApiSlice";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopRatedProductsQuery();
  const [activeTab, setActiveTab] = useState(1);

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="product-tabs">
      <section className="product-tabs__tabs">
        <div
          className={`product-tabs__tabs-item ${
            activeTab === 1 ? "product-tabs__tabs-item--active" : ""
          }`}
          onClick={() => handleTabClick(1)}
        >
          Écrire votre avis
        </div>
        <div
          className={`product-tabs__tabs-item ${
            activeTab === 2 ? "product-tabs__tabs-item--active" : ""
          }`}
          onClick={() => handleTabClick(2)}
        >
          Tous les avis
        </div>
        <div
          className={`product-tabs__tabs-item ${
            activeTab === 3 ? "product-tabs__tabs-item--active" : ""
          }`}
          onClick={() => handleTabClick(3)}
        >
          Produits associés
        </div>
      </section>

      <section>
        {activeTab === 1 && (
          <div className="product-tabs__form">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <div className="my-2">
                  <label htmlFor="rating" className="product-tabs__form-label">
                    Évaluation
                  </label>
                  <select
                    id="rating"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="product-tabs__form-select"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="1">Inférieur</option>
                    <option value="2">Décent</option>
                    <option value="3">Génial</option>
                    <option value="4">Excellent</option>
                    <option value="5">Exceptionnel</option>
                  </select>
                </div>

                <div className="my-2">
                  <label htmlFor="comment" className="product-tabs__form-label">
                    Commentaire
                  </label>
                  <textarea
                    id="comment"
                    rows="3"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="product-tabs__form-textarea"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="product-tabs__form-submit"
                >
                  Soumettre
                </button>
              </form>
            ) : (
              <p>
                Veuillez <Link to="/login">vous connecter</Link> pour écrire un
                avis
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        {activeTab === 2 && (
          <>
            <div>{product.reviews.length === 0 && <p>Aucun avis</p>}</div>
            <div>
              {product.reviews.map((review) => (
                <div key={review._id} className="product-tabs__reviews-item">
                  <div className="flex justify-between">
                    <strong className="product-tabs__reviews-item-author">
                      {review.name}
                    </strong>
                    <p className="product-tabs__reviews-item-date">
                      {review.createdAt.substring(0, 10)}
                    </p>
                  </div>
                  <p className="my-4">{review.comment}</p>
                  <Ratings value={review.rating} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        {activeTab === 3 && (
          <section className="product-tabs__related-products">
            {!data ? (
              <Loader />
            ) : (
              data.map((product) => (
                <div key={product._id}>
                  <SmallProduct product={product} />
                </div>
              ))
            )}
          </section>
        )}
      </section>
    </div>
  );
};

export default ProductTabs;
