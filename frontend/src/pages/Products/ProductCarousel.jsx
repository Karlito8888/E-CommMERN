import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import moment from "moment";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import { useGetTopRatedProductsQuery } from "../../redux/features/productApiSlice";
import { Link } from "react-router-dom";

const ProductCarousel = () => {
  const { data, isLoading, error } = useGetTopRatedProductsQuery();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  if (isLoading) return null;
  
  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <Message variant="info">Aucun produit à afficher</Message>;
  }

  return (
    <div className="product-carousel">
      <Slider {...settings} className="slider-container">
        {data.map(({
          image,
          _id,
          name,
          price,
          description,
          brand,
          createdAt,
          numReviews,
          rating,
          stock,
        }) => (
          <div key={_id} className="carousel-slide">
            <Link to={`/product/${_id}`} className="slide-content">
              <img
                src={image}
                alt={name}
                className="slider-image"
                loading="lazy"
              />
              <div className="product-details">
                <div className="product-info">
                  <h2 className="product-title">{name}</h2>
                  <p className="product-price">{price.toFixed(2)}€</p>
                  <p className="product-description">
                    {description.length > 170 
                      ? `${description.substring(0, 170)}...` 
                      : description}
                  </p>
                </div>
                <div className="product-meta">
                  <div className="brand-details">
                    <span className="meta-item">
                      <FaStore className="icon" /> {brand}
                    </span>
                    <span className="meta-item">
                      <FaClock className="icon" /> {moment(createdAt).fromNow()}
                    </span>
                    <span className="meta-item">
                      <FaStar className="icon" /> {numReviews} avis
                    </span>
                  </div>
                  <div className="stock-details">
                    <span className="meta-item">
                      <FaStar className="icon" /> Note: {rating.toFixed(1)}
                    </span>
                    <span className="meta-item">
                      <FaBox className="icon" /> Stock: {stock}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
