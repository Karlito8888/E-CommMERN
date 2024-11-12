import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";
import { useGetCurrentUserProfileQuery } from "../../redux/features/usersApiSlice";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress?.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Utilisation du hook pour obtenir le profil de l'utilisateur actuel
  const {
    data: userProfile,
    isLoading,
    error,
  } = useGetCurrentUserProfileQuery();

  useEffect(() => {
    if (userProfile && userProfile.user && userProfile.user.shippingAddress) {
      setAddress(userProfile.user.shippingAddress.address || "");
      setCity(userProfile.user.shippingAddress.city || "");
      setPostalCode(userProfile.user.shippingAddress.postalCode || "");
      setCountry(userProfile.user.shippingAddress.country || "");
    }
  }, [userProfile]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Sauvegarde de l'adresse dans le store Redux
    dispatch(saveShippingAddress({ address, city, postalCode, country }));

    // Navigation vers la page de commande
    navigate("/placeorder");
  };

  return (
    <div className="shipping-container">
      <ProgressSteps step1 step2 />
      <div className="shipping-form-container">
        <form onSubmit={submitHandler} className="shipping-form">
          <h1 className="shipping-form-title">Adresse de livraison</h1>

          <div className="input-group">
            <label className="input-label">Adresse </label>
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
            <label className="input-label">Ville</label>
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
            <label className="input-label">Code postal</label>
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
            <label className="input-label">Pays</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button className="submit-button" type="submit">
            Continuer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
