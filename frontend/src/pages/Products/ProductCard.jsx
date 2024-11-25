import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully");
  };

  if (!p || !p._id) {
    return null;
  }

  return (
    <div className="product-card-shop">
      <section className="product-card-image">
        <Link to={`/product/${p._id}`}>
          <span className="brand-tag">{p?.brand}</span>
          <img
            className="product-image"
            src={p.image}
            alt={`Image of ${p.name} from ${p.brand}`}
            loading="lazy"
          />
        </Link>
        <HeartIcon product={p} />
      </section>

      <div className="product-details">
        <div className="flex justify-between">
          <h5 className="product-name">{p?.name}</h5>
          <p className="product-price">
            {p?.price?.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>

        <p className="product-description">
          {p?.description?.substring(0, 60)} ...
        </p>

        <section className="action-buttons">
          <Link to={`/product/${p._id}`} className="read-more-btn">
            plus d'infos
            <svg
              className="w-3.5 h-3.5 ml-2"
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
          </Link>

          <button
            className="add-to-cart-btn"
            onClick={() => addToCartHandler(p, 1)}
            aria-label={`Add ${p.name} to cart`}
          >
            <AiOutlineShoppingCart size={25} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProductCard;
