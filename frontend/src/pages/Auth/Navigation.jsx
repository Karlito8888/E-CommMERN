// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../redux/features/auth/authSlice.js";
import { useLogoutUserMutation } from "../../redux/features/usersApiSlice";
import Cart from "./icons/cart.svg";
import Heart from "./icons/heart.svg";
import Home from "./icons/home.svg";
import Login from "./icons/login.svg";
import Shopping from "./icons/shop.svg";
import Register from "./icons/subscribe.svg";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  // const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutUserMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside>
      <nav role="navigation">
        <ul className="main-nav" role="menubar">
          <li className="nav-item" role="none">
            <Link to="/" className="nav-link" role="menuitem">
              <img src={Home} alt="Home" />
              <span>Accueil</span>
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link to="/shop" className="nav-link" role="menuitem">
              <img src={Shopping} alt="Shopping" />
              <span>Shop</span>
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link to="/cart" className="nav-link" role="menuitem">
              <div className="flex-cart">
                <img src={Cart} alt="Cart" />
                <span>Panier</span>
              </div>
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link to="/favorite" className="nav-link" role="menuitem">
              <img src={Heart} alt="Favorites" />
              <span>Mes favoris</span>
            </Link>
          </li>
        </ul>

        <div className="user-nav">
          {userInfo ? (
            <div className="user-info">
              <span className="user-name">{userInfo.username}</span>
              <ul
                className={`user-menu ${userInfo.isAdmin ? "admin-menu" : ""}`}
                role="menu"
              >
                {userInfo.isAdmin && (
                  <>
                    <li role="none">
                      <Link
                        to="/admin/dashboard"
                        className="user-menu-item"
                        role="menuitem"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li role="none">
                      <Link
                        to="/admin/productlist"
                        className="user-menu-item"
                        role="menuitem"
                      >
                        Produits
                      </Link>
                    </li>
                    <li role="none">
                      <Link
                        to="/admin/categorylist"
                        className="user-menu-item"
                        role="menuitem"
                      >
                        Categories
                      </Link>
                    </li>
                    <li role="none">
                      <Link
                        to="/admin/orderlist"
                        className="user-menu-item"
                        role="menuitem"
                      >
                        Commandes
                      </Link>
                    </li>
                    <li role="none">
                      <Link
                        to="/admin/userlist"
                        className="user-menu-item"
                        role="menuitem"
                      >
                        Users
                      </Link>
                    </li>
                  </>
                )}
                <li role="none">
                  <Link
                    to="/profile"
                    className="user-menu-item"
                    role="menuitem"
                  >
                    Profil
                  </Link>
                </li>
                <li role="none">
                  <button
                    onClick={logoutHandler}
                    className="user-menu-item logout-button"
                    role="menuitem"
                  >
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <ul className="guest-nav" role="menu">
              <li role="none">
                <Link to="/login" className="nav-link" role="menuitem">
                  <img src={Login} alt="Login" />
                  <span>Se connecter</span>
                </Link>
              </li>
              <li role="none">
                <Link to="/register" className="nav-link" role="menuitem">
                  <img src={Register} alt="Register" />
                  <span>s'inscrire</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Navigation;
