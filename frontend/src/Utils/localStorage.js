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

/**
 * Gestion des favoris dans le localStorage
 */
export const FavoritesStorage = {
  KEY: 'favorites',

  getItems() {
    return LocalStorage.get(this.KEY, []);
  },

  set(favorites) {
    return LocalStorage.set(this.KEY, favorites);
  },

  addItem(product) {
    const favorites = this.getItems();
    favorites.push(product);
    return this.set(favorites);
  },

  removeItem(productId) {
    const favorites = this.getItems().filter(item => item._id !== productId);
    return this.set(favorites);
  },

  clear() {
    return LocalStorage.remove(this.KEY);
  }
};

/**
 * Gestion du state Redux
 */
export const ReduxStorage = {
  KEY: 'reduxState',

  loadState() {
    return LocalStorage.get(this.KEY, undefined);
  },

  saveState(state) {
    return LocalStorage.set(this.KEY, state);
  },

  clearState() {
    return LocalStorage.remove(this.KEY);
  }
};

export default LocalStorage;
