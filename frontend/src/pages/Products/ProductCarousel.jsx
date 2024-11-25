import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaStar } from "react-icons/fa";
import { useGetProductsQuery } from "../../redux/features/productApiSlice";
import { useGetCategoriesQuery } from "../../redux/features/categoriesApiSlice";
import { Link } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";

const ProductImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className="image-container">
      {isLoading && (
        <div className="image-placeholder">
          <div className="loading-spinner"></div>
      </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`product-image ${isLoading ? 'loading' : 'loaded'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {hasError && (
        <div className="image-error">
          <span>Image non disponible</span>
        </div>
      )}
    </div>
  );
};

const ProductCarousel = () => {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useGetProductsQuery({});

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    cssEase: "linear",
    swipeToSlide: true,
    centerMode: false,
    focusOnSelect: false,
    accessibility: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
    ],
  };

  const duplicateProducts = useCallback((products, minCount) => {
    if (products.length === 0) return [];
    const duplicates = [];
    while (duplicates.length < minCount) {
      duplicates.push(...products.map(product => ({
        ...product,
        _id: `${product._id}_${Math.floor(duplicates.length / products.length)}`
      })));
    }
    return duplicates;
  }, []);

  const productsByCategory = useMemo(() => {
    if (!categories || !productsData) return {};

    return categories.reduce((acc, category) => {
      const categoryProducts = productsData.products
        .filter(product => product.category === category._id)
        .sort((a, b) => b.rating - a.rating);
      
      if (categoryProducts.length > 0) {
        // Dupliquer les produits pour avoir au moins 10 éléments (2 rotations complètes pour 5 slides)
        const duplicatedProducts = duplicateProducts(categoryProducts, 10);
        acc[category._id] = {
          name: category.name,
          products: duplicatedProducts
        };
      }
      return acc;
    }, []);
  }, [categories, productsData, duplicateProducts]);

  if (categoriesLoading || productsLoading) return <div>Chargement...</div>;
  
  if (categoriesError || productsError) {
    return (
      <Message variant="danger">
        {categoriesError?.data?.message || productsError?.data?.message || "Une erreur est survenue"}
      </Message>
    );
  }

  return (
    <div className="category-carousels">
      {Object.entries(productsByCategory)
        .sort(([, a], [, b]) => b.products.length - a.products.length)
        .map(([categoryId, { name, products }]) => (
        <div key={categoryId} className="category-section">
          <h2>{name}</h2>
          <Slider {...settings}>
            {products.map((product) => (
              <div key={product._id} className="carousel-product">
                <Link 
                  to={`/product/${product._id.split('_')[0]}`}
                  className="product-link"
                  aria-label={`Voir le produit ${product.name}, Prix: ${product.price.toFixed(2)} euros, Note: ${Number(product.rating).toFixed(1)} sur 5`}
                >
                  <div className="product-card">
                    <ProductImage src={product.image} alt={product.name} />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="rating">
                        <FaStar /> <span>{Number(product.rating).toFixed(1)}</span>
                      </div>
                      <div className="price">{product.price.toFixed(2)}€</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      ))}
    </div>
  );
};

export default ProductCarousel;
