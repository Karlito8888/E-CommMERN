import { useGetTopRatedProductsQuery } from "../redux/features/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import Message from "./Message";
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";

const PODIUM_ORDER = [1, 0, 2]; // [2ème, 1er, 3ème]
const RANK_ICONS = {
  0: { icon: FaTrophy, color: "gold", label: "1er", height: "220px" },
  1: { icon: FaMedal, color: "silver", label: "2ème", height: "180px" },
  2: { icon: FaAward, color: "#CD7F32", label: "3ème", height: "160px" }
};

const Podium = () => {
  const { data, isLoading, error } = useGetTopRatedProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">
        Une erreur est survenue lors du chargement des produits les mieux notés.
      </Message>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Message variant="info">
        Aucun produit top n'est disponible pour le moment.
      </Message>
    );
  }

  const topThreeProducts = data.slice(0, 3);

  return (
    <div className="podium-section">
      
      <div className="podium-container">
        <div className="podium-layout">
          {PODIUM_ORDER.map((position) => {
            const product = topThreeProducts[position];
            const { icon: RankIcon, color, label, height } = RANK_ICONS[position];
            
            return (
              <div 
                key={product._id} 
                className={`podium-position position-${position}`}
                style={{ 
                  '--podium-height': height,
                }}
              >
                <div className="product-rank">
                  <div className="rank-badge" style={{ backgroundColor: color }}>
                    <RankIcon className="rank-icon" />
                    <span className="rank-label">{label}</span>
                  </div>
                  <SmallProduct product={product} />
                  <div className="product-stats">
                    <div className="rating-info">
                      <span className="rating-value">{product.rating.toFixed(1)}</span>
                      <span className="rating-max">/5</span>
                    </div>
                    <div className="reviews-count">
                      {product.numReviews} {product.numReviews > 1 ? 'avis' : 'avis'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Podium;
