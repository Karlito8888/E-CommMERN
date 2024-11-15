import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth/authSlice.js";
import { useLogoutMutation } from "../../redux/features/usersApiSlice";
import NavItem from "../../components/auth/NavItems.jsx";
import Cart from "./icons/cart.svg";
import Heart from "./icons/heart.svg";
import Home from "./icons/home.svg";
import Login from "./icons/login.svg";
import Shopping from "./icons/shop.svg";
import Register from "./icons/subscribe.svg";
import Logout from "./icons/logout.svg";
import Profile from "./icons/profile.svg";
import Bag from "./icons/bag-check.svg";
import Categories from "./icons/categories.svg";
import Dashboard from "./icons/dashboard.svg";
import Products from "./icons/products.svg";
import Users from "./icons/users.svg";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
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

  const totalCartItems = cartItems.reduce((a, c) => a + c.qty, 0);

  return (
    <aside>
      <nav role="navigation">
        <ul className="main-nav" role="menubar">
          <NavItem to="/" icon={Home} label="Accueil" />
          <NavItem to="/shop" icon={Shopping} label="Shop" />
          <NavItem to="/cart" icon={Cart} label="Panier">
            {totalCartItems > 0 && (
              <span className="cart-quantity-indicator">
                <span className="quantity-badge">{totalCartItems}</span>
              </span>
            )}
          </NavItem>

          <NavItem to="/favorite" icon={Heart} label="Mes favoris" />
        </ul>

        <div className="user-nav">
          {userInfo ? (
            <div className="user-info">
              <span className="user-name">👋 {userInfo.user.username}</span>
              <ul
                className={`user-menu ${
                  userInfo.user.isAdmin ? "admin-menu" : ""
                }`}
                role="menu"
              >
                {userInfo.user.isAdmin && (
                  <>
                    <NavItem
                      to="/admin/dashboard"
                      icon={Dashboard}
                      label="Dashboard"
                    />
                    <NavItem
                      to="/admin/productlist"
                      icon={Products}
                      label="Produits"
                    />
                    <NavItem
                      to="/admin/categorylist"
                      icon={Categories}
                      label="Categories"
                    />
                    <NavItem
                      to="/admin/orderlist"
                      icon={Bag}
                      label="Commandes"
                    />
                    <NavItem to="/admin/userlist" icon={Users} label="Users" />
                  </>
                )}
                <NavItem to="/profile" icon={Profile} label="Profil" />
                <NavItem
                  onClick={logoutHandler}
                  icon={Logout}
                  label="Déconnexion"
                />
              </ul>
            </div>
          ) : (
            <ul className="guest-nav" role="menu">
              <NavItem to="/login" icon={Login} label="Se connecter" />
              <NavItem to="/register" icon={Register} label="S'inscrire" />
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Navigation;
