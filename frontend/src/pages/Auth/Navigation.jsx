// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
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

  const [logoutApiCall] = useLogoutMutation();

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
      <nav>
        <ul className="main-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <img src={Home} alt="Home" />
              <span>Accueil</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-link">
              <img src={Shopping} alt="Shopping" />
              <span>Shop</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link">
              <div className="flex-cart">
                <img src={Cart} alt="Cart" />
                <span>Panier</span>
              </div>
              {/* <div className="absolute-cart">
                {cartItems.length > 0 && (
                  <span>
                    <span>{cartItems.reduce((a, c) => a + c.qty, 0)}</span>
                  </span>
                )}
              </div> */}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/favorite" className="nav-link">
              <img src={Heart} alt="Favorites" />
              <span>Mes favoris</span> 
              {/* <FavoritesCount /> */}
            </Link>
          </li>
        </ul>

        <div className="user-navigation">
          {userInfo ? (
            <div className="user-info">
              <span className="user-name">{userInfo.username}</span>
              <ul
                className={`user-menu ${userInfo.isAdmin ? "admin-menu" : ""}`}
              >
                {userInfo.isAdmin && (
                  <>
                    <li>
                      <a href="/admin/dashboard" className="user-menu-item">
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a href="/admin/productlist" className="user-menu-item">
                        Produits
                      </a>
                    </li>
                    <li>
                      <a href="/admin/categorylist" className="user-menu-item">
                        Categories
                      </a>
                    </li>
                    <li>
                      <a href="/admin/orderlist" className="user-menu-item">
                        Commandes
                      </a>
                    </li>
                    <li>
                      <a href="/admin/userlist" className="user-menu-item">
                        Users
                      </a>
                    </li>
                  </>
                )}
                <li>
                  <a href="/profile" className="user-menu-item">
                    Profil
                  </a>
                </li>
                <li>
                  <button
                    onClick={logoutHandler}
                    className="user-menu-item logout-button"
                  >
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <ul className="guest-nav">
              <li>
                <Link to="/login" className="nav-link">
                  <img src={Login} alt="Login" />
                  <span>Se connecter</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="nav-link">
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
