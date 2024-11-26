import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useGetProductsQuery } from '../redux/features/productApiSlice';
import '../assets/styles/components/_header.scss';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { data: productsData } = useGetProductsQuery({});

  const [filteredProducts, setFilteredProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length >= 2 && productsData?.products) {
      const searchTerm = term.toLowerCase();
      const results = productsData.products
        .filter((product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5); // Limiter à 5 résultats
      setFilteredProducts(results);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  };

  const handleProductSelect = (product) => {
    setSearchTerm("");
    setShowResults(false);
    navigate(`/product/${product._id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>Mern-K'up</h1>
          </Link>
          
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  aria-label="Rechercher un produit"
                />
                <button type="submit" aria-label="Lancer la recherche">
                  <FiSearch className="search-icon" />
                </button>
              </div>
            </form>

            {showResults && filteredProducts.length > 0 && (
              <div className="search-results">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="search-result-item"
                    onClick={() => handleProductSelect(product)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="search-result-content">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="search-result-image"
                      />
                      <div className="search-result-info">
                        <div className="search-result-name">{product.name}</div>
                        <div className="search-result-price">{product.price.toFixed(2)}€</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>

          {userInfo && (
            <>
              <div className="user-menu">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-expanded={showUserMenu}
                >
                  <span className="username">{userInfo.username}</span>
                  <FiUser />
                </button>
                
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <Link to="/profile">Mon profil</Link>
                    <Link to="/orders">Mes commandes</Link>
                    {userInfo.isAdmin && (
                      <Link to="/admin/dashboard">Dashboard Admin</Link>
                    )}
                    <hr />
                    <Link to="/logout">Déconnexion</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
