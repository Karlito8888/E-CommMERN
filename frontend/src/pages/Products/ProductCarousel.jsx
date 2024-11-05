// frontend/src/pages/Products/productCarousel.jsx

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
import { useGetTopProductsQuery } from "../../redux/features/productApiSlice";

const ProductCarousel = () => {
  const { data: products = [], isLoading, error } = useGetTopProductsQuery();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="product-carousel">
      {isLoading ? null : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        Array.isArray(products) && (
          <Slider {...settings} className="slider-container">
            {products.map(
              ({
                image,
                _id,
                name,
                price,
                description,
                brand,
                createdAt,
                numReviews,
                rating,
                quantity,
                stock,
              }) => (
                <div key={_id}>
                  <img src={image} alt={name} className="slider-image" />
                  <div className="product-details">
                    <div className="product-info">
                      <h2 className="product-title">{name}</h2>
                      <p className="product-price">$ {price}</p>
                      <p className="product-description">
                        {description.substring(0, 170)} ...
                      </p>
                    </div>
                    <div className="product-meta">
                      <div className="brand-details">
                        <h1 className="meta-item">
                          <FaStore className="icon" /> Brand: {brand}
                        </h1>
                        <h1 className="meta-item">
                          <FaClock className="icon" /> Added:{" "}
                          {moment(createdAt).fromNow()}
                        </h1>
                        <h1 className="meta-item">
                          <FaStar className="icon" /> Reviews: {numReviews}
                        </h1>
                      </div>
                      <div className="stock-details">
                        <h1 className="meta-item">
                          <FaStar className="icon" /> Ratings:{" "}
                          {Math.round(rating)}
                        </h1>
                        <h1 className="meta-item">
                          <FaShoppingCart className="icon" /> Quantity:{" "}
                          {quantity}
                        </h1>
                        <h1 className="meta-item">
                          <FaBox className="icon" /> In Stock: {stock}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </Slider>
        )
      )}
    </div>
  );
};

export default ProductCarousel;

