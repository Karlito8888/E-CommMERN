import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiSearch, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import '../assets/styles/components/_header.scss';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Gérer le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gérer le thème
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>E-CommMERN</h1>
          </Link>
          
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              aria-label="Rechercher"
            />
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
