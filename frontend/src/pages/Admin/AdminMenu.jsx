import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import classNames from "classnames";

const AdminMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const menuItems = [
    { to: "/admin/dashboard", label: "Admin Dashboard" },
    { to: "/admin/categorylist", label: "Create Category" },
    { to: "/admin/product/create", label: "Create Product" },
    { to: "/admin/productlist", label: "All Products" },
    { to: "/admin/userlist", label: "Manage Users" },
    { to: "/admin/orderlist", label: "Manage Orders" },
  ];

  return (
    <>
      <button
        className={classNames("menu-toggle", { "menu-open": isMenuOpen })}
        onClick={toggleMenu}
      >
        {isMenuOpen ? (
          <FaTimes color="white" />
        ) : (
          <div className="hamburger">
            <div />
            <div />
            <div />
          </div>
        )}
      </button>

      {isMenuOpen && (
        <section className="menu">
          <nav aria-label="Main menu">
            <ul className="menu-list">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    className="menu-item"
                    to={item.to}
                    style={({ isActive }) => ({
                      color: isActive ? "greenyellow" : "white",
                    })}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      )}
    </>
  );
};

export default AdminMenu;

