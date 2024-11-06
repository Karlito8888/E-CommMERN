// frontend/src/pages/Cart.jsx 

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  // Calculer le nombre total d'articles et le prix total
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  return (
    <div className="cart-container">
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="cart__empty-message">Votre panier est vide.</p>
          <Link to="/shop" className="cart__link">
            Visitez la boutique pour ajouter des articles !
          </Link>
        </div>
      ) : (
        <div className="cart">
          <h1 className="cart__title">Shopping Cart</h1>
          {cartItems.map((item) => (
            <div key={item._id} className="cart__item">
              <div className="cart__item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart__item-details">
                <Link
                  to={`/product/${item._id}`}
                  className="cart__item-details-name"
                >
                  {item.name}
                </Link>
                <div className="cart__item-details-brand">{item.brand}</div>
                <div className="cart__item-details-price">
                  {item.price.toFixed(2)} €
                </div>
              </div>
              <div className="cart__item-quantity">
                <label htmlFor={`qty-${item._id}`} className="sr-only">
                  Quantité
                </label>
                <select
                  id={`qty-${item._id}`}
                  value={item.qty}
                  onChange={(e) =>
                    addToCartHandler(item, Number(e.target.value))
                  }
                >
                  {[...Array(item.stock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="cart__item-remove-btn"
                onClick={() => removeFromCartHandler(item._id)}
                aria-label={`Supprimer ${item.name} du panier`}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <div className="cart__summary">
            <div className="cart__summary-container">
              <h2 className="cart__summary-total">Articles ({totalItems})</h2>
              <div className="cart__summary-total">{totalPrice} €</div>
              <button
                className="cart__summary-btn"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Procéder au paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
