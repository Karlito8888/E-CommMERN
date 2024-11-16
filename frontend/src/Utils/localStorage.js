/**
 * Wrapper pour localStorage avec gestion d'erreurs et typage
 */
class LocalStorage {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  }

  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Erreur lors du nettoyage du localStorage:', error);
      return false;
    }
  }
}

// Constantes pour les clés de localStorage
const STORAGE_KEYS = {
  AUTH: 'userInfo',
  FAVORITES: 'favorites',
  CART: 'cartItems',
};

/**
 * Récupère les informations d'authentification depuis le localStorage
 */
export const getAuthFromLocalStorage = () => {
  return LocalStorage.get(STORAGE_KEYS.AUTH);
};

/**
 * Récupère les favoris depuis le localStorage
 */
export const getFavoritesFromLocalStorage = () => {
  return LocalStorage.get(STORAGE_KEYS.FAVORITES, []);
};

/**
 * Ajoute un produit aux favoris dans le localStorage
 */
export const addFavoriteToLocalStorage = (product) => {
  const favorites = getFavoritesFromLocalStorage();
  if (!favorites.some(item => item._id === product._id)) {
    favorites.push(product);
    LocalStorage.set(STORAGE_KEYS.FAVORITES, favorites);
  }
};

/**
 * Supprime un produit des favoris dans le localStorage
 */
export const removeFavoriteFromLocalStorage = (productId) => {
  const favorites = getFavoritesFromLocalStorage();
  const updatedFavorites = favorites.filter(item => item._id !== productId);
  LocalStorage.set(STORAGE_KEYS.FAVORITES, updatedFavorites);
};

/**
 * Récupère le panier depuis le localStorage
 */
export const getCartFromLocalStorage = () => {
  return LocalStorage.get(STORAGE_KEYS.CART, {
    items: [],
    shippingAddress: {},
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0
  });
};

/**
 * Gestion des favoris dans le localStorage
 */
export const FavoritesStorage = {
  KEY: STORAGE_KEYS.FAVORITES,
  
  getItems() {
    return LocalStorage.get(this.KEY, []);
  },
  
  set(favorites) {
    return LocalStorage.set(this.KEY, favorites);
  },
  
  addItem(product) {
    const favorites = this.getItems();
    if (!favorites.some(item => item._id === product._id)) {
      favorites.push(product);
      this.set(favorites);
    }
  },
  
  removeItem(productId) {
    const favorites = this.getItems();
    const newFavorites = favorites.filter(item => item._id !== productId);
    this.set(newFavorites);
  },
  
  clear() {
    LocalStorage.remove(this.KEY);
  }
};

/**
 * Gestion du state Redux
 */
export const ReduxStorage = {
  KEY: 'reduxState',
  
  loadState() {
    return LocalStorage.get(this.KEY);
  },
  
  saveState(state) {
    LocalStorage.set(this.KEY, state);
  },
  
  clearState() {
    LocalStorage.remove(this.KEY);
  }
};

// Fonctions d'accès direct au localStorage
export const getItem = (key, defaultValue = null) => LocalStorage.get(key, defaultValue);
export const setItem = (key, value) => LocalStorage.set(key, value);
export const removeItem = (key) => LocalStorage.remove(key);
export const clearItems = () => LocalStorage.clear();

export default LocalStorage;
