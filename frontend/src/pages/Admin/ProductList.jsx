// frontend/src/pages/ProductList.jsx

import moment from "moment";
import { useGetProductsQuery as useMongoProductsQuery } from "../../redux/features/productApiSlice";
import { useGetProductsQuery as useFakeStoreProductsQuery } from "../../redux/FakeStore/fakeStoreProductApiSlice"; // Importation pour les produits FakeStore
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  // Récupération des produits de MongoDB
  const {
    data: mongoData,
    isLoading: isLoadingMongo,
    isError: isErrorMongo,
  } = useMongoProductsQuery();
  const mongoProducts = mongoData?.products || [];

  // Récupération des produits de FakeStore
  const {
    data: fakeStoreData,
    isLoading: isLoadingFakeStore,
    isError: isErrorFakeStore,
  } = useFakeStoreProductsQuery();
  const fakeStoreProducts = fakeStoreData || []; // FakeStore renvoie directement la liste

  // Gestion des chargements et erreurs pour chaque source
  if (isLoadingMongo || isLoadingFakeStore) {
    return <div className="loading">Loading...</div>;
  }

  if (isErrorMongo || isErrorFakeStore) {
    return <div className="error">Error loading products</div>;
  }

  // Combine les produits de MongoDB et FakeStore
  const allProducts = [
    ...mongoProducts.map((product) => ({ ...product, source: "mongo" })),
    ...fakeStoreProducts.map((product) => ({ ...product, source: "fake" })),
  ];

  if (!Array.isArray(allProducts)) {
    return <div className="error">Unexpected data format</div>;
  }

  return (
    <>
      <section className="products-content">
        <div className="products-header">
          <h1>All Products ({allProducts.length})</h1>
        </div>
        <AdminMenu />
        <ul className="product-list">
          {/* {allProducts.map((product) => (
            <li key={product._id} className="product-card"> */}
          {allProducts.map((product, index) => (
            <li
              key={
                product._id
                  ? `mongo-${product._id}`
                  : `fake-${product.id || index}`
              }
              className="product-card"
            >
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
