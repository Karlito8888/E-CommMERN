import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import { useGetCategoriesQuery } from "../redux/features/categoriesApiSlice";
import { 
  useGetFilteredProductsQuery, 
  useGetProductsQuery,
  useGetAllBrandsQuery
} from "../redux/features/productApiSlice";
import Message from "../components/Message";
import SmallProduct from "./Products/SmallProduct";

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

  return (
    <div className="shop">
      {/* Shop filters */}
      <div className="shop-filters">
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

      {/* Shop content */}
      <div className="shop-content">
        {error ? (
          <Message type="error">{error.data?.message || "Une erreur est survenue"}</Message>
        ) : isLoading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="product-skeleton">
                <div className="image-skeleton"></div>
                <div className="content-skeleton">
                  <div className="title-skeleton"></div>
                  <div className="price-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <Message>Aucun produit trouvé</Message>
        ) : (
          <>
            <div className="products-grid">
              {productsData?.products.map((product) => (
                <div key={product._id} className="small-product-container">
                  <SmallProduct product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil((productsData?.total || 0) / productsPerPage) > 1 && (
              <div className="pagination">
                {[...Array(Math.ceil((productsData?.total || 0) / productsPerPage))].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
