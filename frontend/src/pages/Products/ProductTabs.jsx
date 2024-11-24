import { useState } from "react";
import { Link } from "react-router-dom";
import SmallProduct from "./SmallProduct";
import { useGetRelatedProductsQuery } from "../../redux/features/productApiSlice";
import Rating from "../../components/Rating";
import StarRating from "../../components/StarRating";

const TabButton = ({ isActive, onClick, children }) => (
  <button
    className={`tab-button ${isActive ? "active" : ""}`}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

const ReviewForm = ({ userInfo, onSubmit, rating, setRating, comment, setComment, isLoading }) => {
  if (!userInfo) {
    return (
      <p className="login-prompt">
        Veuillez <Link to="/login">vous connecter</Link> pour écrire un avis
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="review-form">
      <div className="form-group">
        <label>Votre note</label>
        <StarRating rating={Number(rating)} onRatingChange={setRating} />
      </div>

      <div className="form-group">
        <label htmlFor="comment">Commentaire</label>
        <textarea
          id="comment"
          rows="3"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button type="submit" disabled={isLoading || !rating} className="submit-button">
        Soumettre
      </button>
    </form>
  );
};

const ReviewList = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="no-reviews">Aucun avis</p>;
  }

  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <article 
          key={`${review.user}-${review.createdAt}`} 
          className="review-item"
        >
          <header className="review-header">
            <strong>{review.name}</strong>
            <time dateTime={review.createdAt}>
              {review.createdAt.substring(0, 10)}
            </time>
          </header>
          <p className="review-comment">{review.comment}</p>
          <Rating value={review.rating} />
        </article>
      ))}
    </div>
  );
};

const RelatedProducts = ({ product, isLoading }) => {
  const { data: relatedProducts, isLoading: loadingRelated } = useGetRelatedProductsQuery({
    productId: product._id,
    categoryId: product.category._id
  });

  if (isLoading || loadingRelated) {
    return <div className="loading">Chargement...</div>;
  }

  if (!relatedProducts?.length) {
    return <p>Aucun produit similaire trouvé</p>;
  }

  return (
    <section className="related-products">
      <h3>Produits similaires</h3>
      <div className="products-grid">
        {relatedProducts.map((product) => (
          <SmallProduct key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

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
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, label: "Écrire votre avis" },
    { id: 2, label: "Tous les avis" },
    { id: 3, label: "Produits associés" },
  ];

  if (!product) return null;

  return (
    <div className="tabs-container">
      <nav className="tabs-nav">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 1 && (
          <ReviewForm
            userInfo={userInfo}
            onSubmit={submitHandler}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            isLoading={loadingProductReview}
          />
        )}

        {activeTab === 2 && <ReviewList reviews={product?.reviews} />}

        {activeTab === 3 && (
          <RelatedProducts product={product} isLoading={loadingProductReview} />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
