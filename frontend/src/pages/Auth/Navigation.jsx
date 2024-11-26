import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth/authSlice.js";
import { useLogoutMutation } from "../../redux/features/usersApiSlice";

// Icons import
import {
  Cart,
  Heart,
  Home,
  Login,
  Shopping,
  Register,
  Logout,
  Profile,
  Bag,
  Categories,
  Dashboard,
  Products,
  Users,
} from "./icons";

import FavoritesCount from "../Products/FavoritesCount";

// Navigation items configuration
const mainNavItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/shop", icon: Shopping, label: "Shop" },
  { to: "/cart", icon: Cart, label: "Panier", showBadge: true },
  { 
    to: "/favorites", 
    icon: Heart, 
    label: "Favoris",
    badge: <FavoritesCount showIcon={false} className="nav-favorites-count" asLink={false} /> 
  },
];

const adminNavItems = [
  { to: "/admin/dashboard", icon: Dashboard, label: "Dashboard" },
  { to: "/admin/productlist", icon: Products, label: "Produits" },
  { to: "/admin/categorylist", icon: Categories, label: "Categories" },
  { to: "/admin/orderlist", icon: Bag, label: "Commandes" },
  { to: "/admin/userlist", icon: Users, label: "Users", className: "admin-users-nav" },
];

const userNavItems = [
  { to: "/profile", icon: Profile, label: "Profil" },
];

const guestNavItems = [
  { to: "/login", icon: Login, label: "Se connecter" },
  { to: "/register", icon: Register, label: "S'inscrire" },
];

// NavItem Component
const NavItem = ({ to, icon, label, onClick, children, className, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const navItemClass = `nav-item ${className || ''} ${isActive ? 'active' : ''}`.trim();
  
  const content = (
    <>
      <img 
        src={icon} 
        alt={label} 
        className={`nav-icon ${isActive ? 'active' : ''}`} 
        loading="lazy" 
      />
      <span className={isActive ? 'active' : ''}>{label}</span>
      {badge}
      {children}
    </>
  );

  return (
    <li className={navItemClass} role="none">
      {to ? (
        <Link to={to} className="nav-link" role="menuitem">
          {content}
        </Link>
      ) : (
        <button onClick={onClick} className="nav-link" role="menuitem">
          {content}
        </button>
      )}
    </li>
  );
};

// Cart Badge Component
const CartBadge = ({ quantity }) => {
  if (quantity <= 0) return null;
  
  return (
    <span className="cart-quantity-indicator">
      <span className="quantity-badge">{quantity}</span>
    </span>
  );
};

// Main Navigation Component
const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
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

  const totalCartItems = items?.reduce((a, c) => a + c.quantity, 0) || 0;

  const renderMainNav = () => (
    <ul className="main-nav" role="menubar">
      {mainNavItems.map(({ to, icon, label, showBadge, badge }) => (
        <NavItem key={to} to={to} icon={icon} label={label} badge={badge}>
          {showBadge && <CartBadge quantity={totalCartItems} />}
        </NavItem>
      ))}
    </ul>
  );

  const renderAdminNav = () => (
    <>
      {adminNavItems.map(({ to, icon, label, className }) => (
        <NavItem key={to} to={to} icon={icon} label={label} className={className} />
      ))}
    </>
  );

  const renderUserNav = () => (
    <div className="user-info">
      <span className="user-name">👋 {userInfo.username}</span>
      <ul className={`user-menu ${userInfo.isAdmin ? "admin-menu" : ""}`} role="menu">
        {userInfo.isAdmin && renderAdminNav()}
        {userNavItems.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}
        <NavItem onClick={logoutHandler} icon={Logout} label="Déconnexion" />
      </ul>
    </div>
  );

  const renderGuestNav = () => (
    <ul className="guest-nav" role="menu">
      {guestNavItems.map(({ to, icon, label }) => (
        <NavItem key={to} to={to} icon={icon} label={label} />
      ))}
    </ul>
  );

  return (
    <aside>
      <nav role="navigation">
        {renderMainNav()}
        <div className="user-nav">
          {userInfo ? renderUserNav() : renderGuestNav()}
        </div>
      </nav>
    </aside>
  );
};

export default Navigation;
