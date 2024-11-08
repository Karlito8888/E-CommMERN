// NavItem.jsx
import { Link } from "react-router-dom";

const NavItem = ({ to, icon, label, onClick, children }) => (
  <li className="nav-item" role="none">
    {to ? (
      <Link to={to} className="nav-link" role="menuitem">
        <img src={icon} alt={label} loading="lazy" />
        <span>{label}</span>
        {children} {/* Permet d'ajouter le span de quantité ici */}
      </Link>
    ) : (
      <button onClick={onClick} className="nav-link" role="menuitem">
        {icon && <img src={icon} alt={label} loading="lazy" />}
        <span>{label}</span>
        {children}
      </button>
    )}
  </li>
);

export default NavItem;
