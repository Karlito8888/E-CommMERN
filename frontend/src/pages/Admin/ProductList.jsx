// frontend/src/pages/ProductList.jsx

import moment from "moment";
import { useGetProductsQuery } from "../../redux/features/productApiSlice";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const { data, isLoading, isError } = useGetProductsQuery();
  const products = data?.products || [];

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isError) {
    return <div className="error">Error loading products</div>;
  }

  if (!Array.isArray(products)) {
    return <div className="error">Unexpected data format</div>;
  }

  return (
    <>
      <section className="products-content">
        <div className="products-header">
          <h1>All Products ({products.length})</h1>
        </div>
        <AdminMenu />
        <ul className="product-list">
          {products.map((product) => (
            <li key={product._id} className="product-card">
              <article className="product-details">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <div className="product-header">
                    <h2 className="product-name">{product.name}</h2>
                    <time className="product-date" dateTime={product.createdAt}>
                      {moment(product.createdAt).format("MMMM Do YYYY")}
                    </time>
                  </div>
                  <p className="product-description">
                    {product.description
                      ? product.description.substring(0, 160)
                      : "No description available"}
                    ...
                  </p>
                  <footer className="product-footer">
                    <button
                      className="update-button"
                      onClick={() =>
                        (window.location.href = `/admin/product/update/${product._id}`)
                      }
                    >
                      Update Product
                      <svg
                        className="update-icon"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </button>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                  </footer>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default ProductList;
