// Shop.jsx

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import { useFetchCategoriesQuery } from "../redux/features/categoriesApiSlice";
import { useGetFilteredProductsQuery } from "../redux/features/productApiSlice";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");

  const filteredProductsQuery = useGetFilteredProductsQuery({ checked, radio });

  useEffect(() => {
    if (categoriesQuery.data && !categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  const filterProducts = () => {
    if (filteredProductsQuery.data && !filteredProductsQuery.isLoading) {
      const filtered = filteredProductsQuery.data.filter(
        (product) =>
          product.price.toString().includes(priceFilter) ||
          product.price === parseInt(priceFilter, 10)
      );
      dispatch(setProducts(filtered));
    }
  };

  useEffect(() => {
    filterProducts();
  }, [checked, radio, priceFilter, filteredProductsQuery.data]);

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter(
      (product) => product.brand === brand
    );
    dispatch(setProducts(productsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = useMemo(() => {
    return [
      ...new Set(
        filteredProductsQuery.data
          ?.map((product) => product.brand)
          .filter(Boolean)
      ),
    ];
  }, [filteredProductsQuery.data]);

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  return (
    <div className="shop-container">
      <div className="flex">
        <aside className="filters">
          <h2>Filter by Categories</h2>
          <div>
            {categories.map((c) => (
              <div key={c._id}>
                <input
                  type="checkbox"
                  onChange={(e) => handleCheck(e.target.checked, c._id)}
                />
                <label>{c.name}</label>
              </div>
            ))}
          </div>

          <h2>Filter by Brands</h2>
          <div>
            {uniqueBrands.map((brand) => (
              <div key={brand}>
                <input
                  type="radio"
                  name="brand"
                  onChange={() => handleBrandClick(brand)}
                />
                <label>{brand}</label>
              </div>
            ))}
          </div>

          <h2>Filter by Price</h2>
          <input
            type="text"
            placeholder="Enter Price"
            value={priceFilter}
            onChange={handlePriceChange}
          />

          <button onClick={() => window.location.reload()}>Reset</button>
        </aside>

        <section className="products">
          <h2>{products.length} Products</h2>
          <div className="product-list">
            {products.length === 0 ? (
              <Loader />
            ) : (
              products.map((p) => <ProductCard key={p._id} p={p} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Shop;
