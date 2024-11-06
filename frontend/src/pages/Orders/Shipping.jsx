import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <div className="shipping-container">
      <ProgressSteps step1 step2 />
      <div className="shipping-form-container">
        <form onSubmit={submitHandler} className="shipping-form">
          <h1 className="shipping-form-title">Shipping</h1>

          <div className="input-group">
            <label className="input-label">Address</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">City</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Postal Code</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Country</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="payment-method-group">
            <label className="payment-method-label">Select Method</label>
            <div className="payment-method-radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  className="payment-method-radio"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="radio-label-text">PayPal or Credit Card</span>
              </label>
            </div>
          </div>

          <button className="submit-button" type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
