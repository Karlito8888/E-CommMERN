import { useGetTopRatedProductsQuery } from "../redux/features/productApiSlice";
import SmallProduct from "../pages/Products/SmallProduct";
import Message from "./Message";
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import { useState, useEffect } from 'react';

const PODIUM_ORDER = [1, 0, 2]; // [2ème, 1er, 3ème]
const RANK_ICONS = {
  0: { icon: FaTrophy, color: "gold", label: "1er", height: "220px" },
  1: { icon: FaMedal, color: "silver", label: "2ème", height: "180px" },
  2: { icon: FaAward, color: "#CD7F32", label: "3ème", height: "160px" }
};

const PodiumSkeleton = () => (
  <div className="podium-section loading">
    <div className="podium-container">
      <h2>Nos meilleurs produits</h2>
      <div className="podium-layout">
        {PODIUM_ORDER.map((position) => (
          <div 
            key={position}
            className={`podium-position position-${position}`}
          >
            <div className="product-rank">
              <div className="skeleton image"></div>
              <div className="skeleton title"></div>
              <div className="skeleton price"></div>
              <div className="skeleton rating"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Podium = () => {
  const { data, isLoading, error } = useGetTopRatedProductsQuery();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(true);

  // Gérer le timer de 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimer(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Gérer le préchargement des images
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const imageUrls = data.slice(0, 3).map(product => product.image);
      let loadedImages = 0;

      const preloadImages = imageUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedImages++;
            if (loadedImages === imageUrls.length) {
              setImagesLoaded(true);
            }
            resolve();
          };
          img.src = url;
        });
      });

      Promise.all(preloadImages);
    }
  }, [data]);

  // Décider quand masquer le skeleton
  useEffect(() => {
    if (!loadingTimer && !isLoading && imagesLoaded) {
      setShowSkeleton(false);
    }
  }, [loadingTimer, isLoading, imagesLoaded]);

  if (error) {
    return (
      <Message variant="danger">
        Une erreur est survenue lors du chargement des produits les mieux notés.
      </Message>
    );
  }

  const topThreeProducts = data?.slice(0, 3) || [];

  return (
    <>
      {showSkeleton ? (
        <PodiumSkeleton />
      ) : (
        <div className="podium-section">
          <h2>Nos meilleurs produits</h2>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Podium;
