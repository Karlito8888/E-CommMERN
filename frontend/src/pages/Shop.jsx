import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import { useGetCategoriesQuery } from "../redux/features/categoriesApiSlice";
import { 
  useGetFilteredProductsQuery, 
  useGetProductsQuery,
  useGetAllBrandsQuery
} from "../redux/features/productApiSlice";
import Message from "../components/Message";

const Shop = () => {
  const dispatch = useDispatch();
  const { checked = [], radio = [] } = useSelector((state) => state.shop);

  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const categoriesQuery = useGetCategoriesQuery();
  const brandsQuery = useGetAllBrandsQuery();
  const allProductsQuery = useGetProductsQuery({
    page: currentPage,
    limit: productsPerPage
  });
  const filteredProductsQuery = useGetFilteredProductsQuery({ 
    checked, 
    radio,
    page: currentPage,
    limit: productsPerPage 
  }, {
    skip: !checked.length && !radio // Skip cette requête si aucun filtre n'est actif
  });

  // Sélectionner la source de données appropriée
  const productsData = checked.length || radio 
    ? filteredProductsQuery.data?.data 
    : allProductsQuery.data?.data;

  const isLoading = checked.length || radio 
    ? filteredProductsQuery.isLoading 
    : allProductsQuery.isLoading;

  const error = checked.length || radio 
    ? filteredProductsQuery.error 
    : allProductsQuery.error;

  // Gestion des catégories
  useEffect(() => {
    if (categoriesQuery.data?.data) {
      dispatch(setCategories(categoriesQuery.data.data));
    }
  }, [categoriesQuery.data, dispatch]);

  // Gestion des produits
  useEffect(() => {
    if (productsData?.products) {
      const filtered = productsData.products.filter(product =>
        !priceFilter || 
        product.price.toString().includes(priceFilter) ||
        product.price === parseInt(priceFilter, 10)
      );
      dispatch(setProducts(filtered));
    }
  }, [productsData, priceFilter, dispatch]);

  // Gestionnaires d'événements
  const handleBrandClick = (brand) => {
    dispatch(setRadio(brand));
    setCurrentPage(1); // Réinitialiser la page lors du changement de filtre
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
    setCurrentPage(1); // Réinitialiser la page lors du changement de filtre
  };

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1); // Réinitialiser la page lors du changement de filtre
  };

  const handleReset = () => {
    dispatch(setChecked([]));
    dispatch(setRadio([]));
    setPriceFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calcul du nombre total de pages
  const totalPages = Math.ceil((productsData?.total || 0) / productsPerPage);

  if (categoriesQuery.isLoading || isLoading || brandsQuery.isLoading) {
    return <Loader />;
  }

  if (categoriesQuery.error || error || brandsQuery.error) {
    return (
      <Message variant="danger">
        Une erreur est survenue lors du chargement des produits.
      </Message>
    );
  }

  return (
    <div className="shop-container">
      {/* Filtres */}
      <div className="filters-container">
        <h2 className="text-xl font-bold mb-4">Filtres</h2>
        
        {/* Prix */}
        <div className="filter-section">
          <h3 className="font-semibold mb-2">Prix</h3>
          <input
            type="number"
            className="price-input"
            placeholder="Filtrer par prix"
            value={priceFilter}
            onChange={handlePriceChange}
          />
        </div>

        {/* Catégories */}
        <div className="filter-section">
          <h3 className="font-semibold mb-2">Catégories</h3>
          {categoriesQuery.data?.data?.map((category) => (
            <div key={category._id} className="category-item">
              <input
                type="checkbox"
                onChange={(e) => handleCheck(e.target.checked, category._id)}
                checked={checked.includes(category._id)}
              />
              <label className="ml-2">{category.name}</label>
            </div>
          ))}
        </div>

        {/* Marques */}
        <div className="filter-section">
          <h3 className="font-semibold mb-2">Marques</h3>
          {brandsQuery.data?.data?.map((brand) => (
            <div key={brand} className="brand-item">
              <input
                type="radio"
                name="brand"
                onChange={() => handleBrandClick(brand)}
                checked={radio === brand}
              />
              <label className="ml-2">{brand}</label>
            </div>
          ))}
        </div>

        {/* Bouton Reset */}
        <button
          onClick={handleReset}
          className="reset-button"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {/* Liste des produits */}
      <div className="products-section">
        <div className="products-grid">
          {productsData?.products?.length > 0 ? (
            productsData.products.map((product) => (
              <ProductCard key={product._id} p={product} />
            ))
          ) : (
            <Message variant="info">Aucun produit trouvé</Message>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
