import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Podium.scss";

const Podium = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          E-Comm
        </Link>

        <nav className="header__nav">
          <ul className="header__nav-list">
            <li>
              <Link to="/" className="header__nav-link">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/products" className="header__nav-link">
                Produits
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/profile" className="header__nav-link">
                    Profil
                  </Link>
                </li>
                {user?.role === "admin" && (
                  <li>
                    <Link to="/admin/dashboard" className="header__nav-link">
                      Admin
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <li>
                <Link to="/login" className="header__nav-link">
                  Connexion
                </Link>
              </li>
            )}
            <li>
              <Link to="/cart" className="header__nav-link">
                Panier
                {cartItems.length > 0 && (
                  <span className="header__cart-count">{cartItems.length}</span>
                )}
              </Link>
            </li>
            <li className="header__theme-toggle"></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Podium;
