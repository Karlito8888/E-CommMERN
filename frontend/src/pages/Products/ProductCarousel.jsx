import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaStar } from "react-icons/fa";
import { useGetProductsQuery } from "../../redux/features/productApiSlice";
import { useGetCategoriesQuery } from "../../redux/features/categoriesApiSlice";
import { Link } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import ValidatedImage from "../../components/ValidatedImage";

const ProductCarousel = () => {
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery({});
  const [validProducts, setValidProducts] = useState({});

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 7,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
    swipeToSlide: true,
    centerMode: false,
    focusOnSelect: false,
    useTransform: true,
    waitForAnimate: true,
    accessibility: false,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 6,
          speed: 700,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          speed: 600,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          arrows: false,
          speed: 500,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          arrows: false,
          speed: 400,
        },
      },
    ],
  };

  const duplicateProducts = useCallback((products, minCount) => {
    if (products.length === 0) return [];
    const duplicates = [];
    while (duplicates.length < minCount) {
      duplicates.push(
        ...products.map((product) => ({
          ...product,
          _id: `${product._id}_${Math.floor(
            duplicates.length / products.length
          )}`,
        }))
      );
    }
    return duplicates;
  }, []);

  const handleImageValidation = useCallback((productId, isValid) => {
    setValidProducts((prev) => ({
      ...prev,
      [productId]: isValid,
    }));
  }, []);

  const productsByCategory = useMemo(() => {
    if (!categories || !productsData || !productsData.products) return {};

    return categories.reduce((acc, category) => {
      const categoryProducts = productsData.products
        .filter(
          (product) => product.category && product.category._id === category._id
        )
        .filter((product) => validProducts[product._id] !== false)
        .sort((a, b) => b.rating - a.rating);

      if (categoryProducts && categoryProducts.length > 0) {
        const duplicatedProducts = duplicateProducts(categoryProducts, 10);
        acc[category._id] = {
          name: category.name,
          products: duplicatedProducts,
          totalUniqueProducts: categoryProducts.length
        };
      }
      return acc;
    }, []);
  }, [categories, productsData, duplicateProducts, validProducts]);

  if (categoriesLoading || productsLoading) return <div>Chargement...</div>;

  if (categoriesError || productsError) {
    return (
      <Message variant="danger">
        {categoriesError?.data?.message ||
          productsError?.data?.message ||
          "Une erreur est survenue"}
      </Message>
    );
  }

  const sortedCategories = Object.entries(productsByCategory)
    .filter(
      ([, category]) =>
        category && category.products && category.products.length > 0
    )
    .sort(
      ([, a], [, b]) =>
        (b.products ? b.products.length : 0) -
        (a.products ? a.products.length : 0)
    );

  if (sortedCategories.length === 0) {
    return <Message>Aucun produit disponible</Message>;
  }

  return (
    <div className="category-carousels">
      {sortedCategories.map(([categoryId, { name, products, totalUniqueProducts }]) => (
        <div key={categoryId} className="category-section">
          <h2>
            {name} <span className="product-count">({totalUniqueProducts})</span>
          </h2>
          <Slider {...settings}>
            {products.map(
              (product) =>
                validProducts[product._id] !== false && (
                  <div 
                    key={product._id} 
                    className="carousel-product"
                  >
                    <div className="product-card">
                      <Link
                        to={`/product/${product._id.split("_")[0]}`}
                        className="product-link"
                        role="link"
                      >
                        <div className="image-container">
                          <ValidatedImage
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                            onValidation={(isValid) =>
                              handleImageValidation(product._id, isValid)
                            }
                          />
                        </div>
                        <div className="product-info">
                          <h3>{product.name}</h3>
                          <div className="product-info-bottom">
                            <div className="rating">
                              <FaStar /> 
                              <span>{Number(product.rating).toFixed(1)}</span>
                            </div>
                            <div className="price">
                              {product.price.toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )
            )}
          </Slider>
        </div>
      ))}
    </div>
  );
};

export default ProductCarousel;
