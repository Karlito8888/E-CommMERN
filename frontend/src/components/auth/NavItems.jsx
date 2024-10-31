// NavItem.jsx
import { Link } from "react-router-dom";

const NavItem = ({ to, icon, label, onClick }) => (
  <li className="nav-item" role="none">
    {to ? (
      <Link to={to} className="nav-link" role="menuitem">
        <img src={icon} alt={label} />
        <span>{label}</span>
      </Link>
    ) : (
      <button onClick={onClick} className="nav-link" role="menuitem">
        {icon && <img src={icon} alt={label} />}
        <span>{label}</span>
      </button>
    )}
  </li>
);

export default NavItem;
