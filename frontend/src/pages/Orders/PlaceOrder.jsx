// frontend/src/pages/placeOrder.jsx

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useCreateCheckoutSessionMutation } from "../../redux/features/services/paymentService";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);

  // Utilisation de la mutation pour créer une session de paiement
  const [createCheckoutSession, { isLoading, error }] =
    useCreateCheckoutSessionMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  // Récupère les informations de l'utilisateur depuis le local storage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Vérifie si userInfo existe et obtient l'email
  const customerEmail = userInfo?.user?.email || null;

  const cartData = {
    cartItems: cart.cartItems,
    shippingAddress: cart.shippingAddress,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    customerEmail: customerEmail, // Assigne l'email de l'utilisateur ici
  };

  // Fonction de gestion de commande avec createCheckoutSession
  const placeOrderHandler = async () => {
    if (!cart.cartItems || cart.cartItems.length === 0) {
      toast.error("Votre panier est vide !");
      return;
    }
    try {
      console.log("cartData:", cartData);

      const response = await createCheckoutSession(cartData).unwrap();
      console.log("Réponse du backend:", response);
      // Vérifie si la session URL existe et redirige
      if (response?.sessionUrl) {
        window.location.href = response.sessionUrl;
      } else {
        throw new Error("URL de session manquante.");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error("Erreur lors de la création de la session de paiement.");
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="place-order-container">
        {cart.cartItems.length === 0 ? (
          <Message>Votre panier est vide</Message>
        ) : (
          <div className="place-order-table">
            <table className="place-order-table__inner">
              <thead>
                <tr>
                  <td className="place-order-table__header">Image</td>
                  <td className="place-order-table__header">Produit</td>
                  <td className="place-order-table__header">Quantité</td>
                  <td className="place-order-table__header">Prix</td>
                  <td className="place-order-table__header">Total</td>
                </tr>
              </thead>
              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="place-order-table__image">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="place-order-table__image-img"
                        loading="lazy"
                      />
                    </td>
                    <td className="place-order-table__product">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </td>
                    <td className="place-order-table__quantity">{item.qty}</td>
                    <td className="place-order-table__price">
                      {item.price.toFixed(2)}
                    </td>
                    <td className="place-order-table__total">
                      {(item.qty * item.price).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="place-order-summary">
          <h2 className="place-order-summary__title">Votre commande</h2>
          <div className="place-order-summary__details">
            <ul className="place-order-summary__list">
              <li>
                <span className="place-order-summary__label">Total HT:</span>
                {cart.itemsPrice} €
              </li>
              <li>
                <span className="place-order-summary__label">
                  Frais de livraison:
                </span>
                {cart.shippingPrice} €
              </li>
              <li>
                <span className="place-order-summary__label">TVA:</span>
                {cart.taxPrice} €
              </li>
              <li>
                <span className="place-order-summary__label">Total:</span>
                {cart.totalPrice} €
              </li>
            </ul>

            {error && (
              <Message variant="danger">{error?.data?.message}</Message>
            )}

            <div className="place-order-summary__shipping">
              <h2 className="place-order-summary__section-title">Livraison</h2>
              <p>
                <strong>Adresse:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="place-order-summary__button"
            disabled={cart.cartItems.length === 0}
            onClick={placeOrderHandler}
          >
            Procéder au paiement
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;
