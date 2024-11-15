// NavItem.jsx
import { Link, useLocation } from "react-router-dom";

const NavItem = ({ to, icon, label, onClick, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="nav-item" role="none">
      {to ? (
        <Link 
          to={to} 
          className={`nav-link ${isActive ? 'active' : ''}`} 
          role="menuitem"
        >
          <img src={icon} alt={label} className="nav-icon" loading="lazy" />
          <span>{label}</span>
          {children}
        </Link>
      ) : (
        <button 
          onClick={onClick} 
          className="nav-link" 
          role="menuitem"
        >
          {icon && <img src={icon} alt={label} className="nav-icon" loading="lazy" />}
          <span>{label}</span>
          {children}
        </button>
      )}
    </li>
  );
};

export default NavItem;
