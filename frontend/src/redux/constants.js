// frontend/src/redux/features/constants.js

// Constante qui définit l'URL de base pour les requêtes API.
// Cette valeur est actuellement vide, mais elle peut être utilisée pour configurer un proxy ou une URL de base commune.
export const BASE_URL = ""; // proxy

// URL pour accéder aux utilisateurs dans l'API.
// Ce chemin est utilisé pour récupérer, créer, mettre à jour ou supprimer des utilisateurs dans le backend.
export const USERS_URL = "/api/users";

// URL pour accéder aux catégories de produits dans l'API.
// Ce chemin permet de gérer les catégories, telles que l'affichage de toutes les catégories ou l'ajout de nouvelles catégories.
export const CATEGORY_URL = "/api/category";

// URL pour accéder aux produits dans l'API.
// Cette constante est utilisée pour interagir avec les produits, que ce soit pour les afficher, les ajouter ou les modifier.
export const PRODUCT_URL = "/api/products";

// URL pour le téléchargement de fichiers dans l'API.
// Cela peut inclure des images de produits ou d'autres fichiers nécessaires pour l'application.
export const UPLOAD_URL = "/api/upload";

// URL pour accéder aux commandes dans l'API.
// Ce chemin permet de récupérer les informations des commandes, de créer de nouvelles commandes ou de gérer les commandes existantes.
export const ORDERS_URL = "/api/orders";

// URL pour la configuration de PayPal dans l'API.
// Cela est généralement utilisé pour configurer les paiements via PayPal, en récupérant des informations nécessaires pour initier des paiements.
export const PAYPAL_URL = "/api/config/paypal";

