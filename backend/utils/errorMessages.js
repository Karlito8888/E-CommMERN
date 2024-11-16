const createErrorMessages = (domain) => ({
  NOT_FOUND: (resource) => `${resource} non trouvé(e)`,
  ALREADY_EXISTS: (resource) => `${resource} existe déjà`,
  REQUIRED_FIELD: (field) => `Le champ ${field} est requis`,
  INVALID_FORMAT: (field) => `Format invalide pour ${field}`,
});

export const ERROR_MESSAGES = {
  USER: {
    ...createErrorMessages('Utilisateur'),
    INVALID_CREDENTIALS: 'Email ou mot de passe invalide',
    ACCOUNT_DISABLED: 'Ce compte a été désactivé',
    DELETED_SUCCESS: 'Utilisateur supprimé avec succès',
    CANNOT_DELETE_ADMIN: 'Impossible de supprimer un administrateur',
    INVALID_ADMIN_STATUS: 'Statut administrateur invalide',
    USERNAME: {
      TOO_SHORT: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      INVALID: 'Le nom d\'utilisateur ne doit contenir que des lettres et des chiffres',
      REQUIRED: 'Le nom d\'utilisateur est requis'
    },
    PASSWORD: {
      TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
      MISSING_UPPERCASE: 'Le mot de passe doit contenir au moins une majuscule',
      MISSING_LOWERCASE: 'Le mot de passe doit contenir au moins une minuscule',
      MISSING_NUMBER: 'Le mot de passe doit contenir au moins un chiffre',
      MISSING_SPECIAL: 'Le mot de passe doit contenir au moins un caractère spécial',
      NOT_MATCH: 'Les mots de passe ne correspondent pas',
      INVALID: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      REQUIRED: 'Le mot de passe est requis',
      CURRENT_REQUIRED: 'Le mot de passe actuel est requis',
      SAME_AS_CURRENT: 'Le nouveau mot de passe doit être différent de l\'ancien'
    },
    EMAIL: {
      INVALID: 'Format d\'email invalide',
      REQUIRED: 'L\'email est requis',
      ALREADY_EXISTS: 'Cet email est déjà utilisé'
    },
    SHIPPING: {
      ADDRESS_REQUIRED: 'L\'adresse est requise',
      CITY_REQUIRED: 'La ville est requise',
      COUNTRY_REQUIRED: 'Le pays est requis',
      INVALID_POSTAL_CODE: 'Code postal invalide',
      POSTAL_CODE_REQUIRED: 'Le code postal est requis'
    }
  },

  CATEGORY: {
    ...createErrorMessages('Catégorie'),
    NAME: {
      REQUIRED: 'Le nom de la catégorie est requis',
      TOO_SHORT: 'Le nom de la catégorie doit contenir au moins 2 caractères',
      TOO_LONG: 'Le nom de la catégorie ne doit pas dépasser 32 caractères',
      INVALID_FORMAT: 'Le nom de la catégorie ne peut contenir que des lettres, chiffres, espaces et tirets'
    },
    DESCRIPTION: {
      TOO_LONG: 'La description ne doit pas dépasser 200 caractères'
    },
    ALREADY_EXISTS: 'Une catégorie avec ce nom existe déjà',
    HAS_PRODUCTS: 'Impossible de supprimer cette catégorie car elle contient des produits',
    NOT_FOUND: 'Catégorie non trouvée',
    DELETED_SUCCESS: 'Catégorie supprimée avec succès'
  },

  PRODUCT: {
    ...createErrorMessages('Produit'),
    NAME: {
      REQUIRED: 'Le nom du produit est requis',
      TOO_SHORT: 'Le nom du produit doit contenir au moins 2 caractères',
      TOO_LONG: 'Le nom du produit ne doit pas dépasser 100 caractères'
    },
    PRICE: {
      REQUIRED: 'Le prix est requis',
      INVALID: 'Le prix doit être un nombre positif',
      MIN_PRICE: 'Le prix minimum doit être un nombre valide',
      MAX_PRICE: 'Le prix maximum doit être un nombre valide',
      RANGE_ERROR: 'Le prix minimum ne peut pas être supérieur au prix maximum'
    },
    DESCRIPTION: {
      REQUIRED: 'La description est requise',
      TOO_SHORT: 'La description doit contenir au moins 10 caractères',
      TOO_LONG: 'La description ne doit pas dépasser 1000 caractères'
    },
    CATEGORY: {
      REQUIRED: 'La catégorie est requise',
      INVALID: 'Catégorie invalide'
    },
    STOCK: {
      INVALID: 'Le stock ne peut pas être négatif',
      INSUFFICIENT: 'Stock insuffisant pour cette opération'
    }
  },

  PAGINATION: {
    PAGE_NUMBER: 'Le numéro de page doit être un nombre positif',
    LIMIT_NUMBER: 'La limite doit être un nombre positif',
    MAX_LIMIT: 'La limite ne peut pas dépasser 100 éléments par page'
  },

  AUTH: {
    ...createErrorMessages('Authentification'),
    TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
    TOKEN_INVALID: 'Token invalide ou manquant',
    UNAUTHORIZED: 'Non autorisé à accéder à cette ressource',
    REFRESH_TOKEN_REQUIRED: 'Token de rafraîchissement requis'
  },

  SESSION: {
    ...createErrorMessages('Session'),
    EXPIRED: 'Session expirée',
    INVALID: 'Session invalide',
    CONCURRENT_LOGIN: 'Connexion détectée sur un autre appareil'
  },

  VALIDATION: {
    ...createErrorMessages('Validation'),
    INVALID_DATA: 'Les données fournies sont invalides',
    INVALID_ID: 'Identifiant invalide'
  },

  SYSTEM: {
    SERVER_ERROR: 'Une erreur est survenue',
    DATABASE_ERROR: 'Erreur de base de données',
    NETWORK_ERROR: 'Erreur réseau',
    RATE_LIMIT: 'Trop de requêtes, veuillez réessayer plus tard'
  }
};
