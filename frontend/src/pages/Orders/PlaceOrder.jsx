import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/features/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="place-order-container">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="place-order-table">
            <table className="place-order-table__inner">
              <thead>
                <tr>
                  <td className="place-order-table__header">Image</td>
                  <td className="place-order-table__header">Product</td>
                  <td className="place-order-table__header">Quantity</td>
                  <td className="place-order-table__header">Price</td>
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
                      $ {(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="place-order-summary">
          <h2 className="place-order-summary__title">Order Summary</h2>
          <div className="place-order-summary__details">
            <ul className="place-order-summary__list">
              <li>
                <span className="place-order-summary__label">Items:</span> $
                {cart.itemsPrice}
              </li>
              <li>
                <span className="place-order-summary__label">Shipping:</span> $
                {cart.shippingPrice}
              </li>
              <li>
                <span className="place-order-summary__label">Tax:</span> $
                {cart.taxPrice}
              </li>
              <li>
                <span className="place-order-summary__label">Total:</span> $
                {cart.totalPrice}
              </li>
            </ul>

            {error && <Message variant="danger">{error.data.message}</Message>}

            <div className="place-order-summary__shipping">
              <h2 className="place-order-summary__section-title">Shipping</h2>
              <p>
                <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>

            <div className="place-order-summary__payment">
              <h2 className="place-order-summary__section-title">
                Payment Method
              </h2>
              <strong>Method:</strong> {cart.paymentMethod}
            </div>
          </div>

          <button
            type="button"
            className="place-order-summary__button"
            disabled={cart.cartItems === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;
