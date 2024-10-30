import moment from "moment";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isError) {
    return <div className="error">Error loading products</div>;
  }

  return (
    <main className="all-products-container">
      <div className="products-header">
        <h1>All Products ({products.length})</h1>
      </div>
      <section className="products-content">
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
                    <h2 className="product-name">{product?.name}</h2>
                    <time className="product-date" dateTime={product.createdAt}>
                      {moment(product.createdAt).format("MMMM Do YYYY")}
                    </time>
                  </div>

                  <p className="product-description">
                    {product?.description?.substring(0, 160)}...
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
                    <p className="product-price">${product?.price}</p>
                  </footer>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <aside className="admin-menu">
          <AdminMenu />
        </aside>
      </section>
    </main>
  );
};

export default AllProducts;
