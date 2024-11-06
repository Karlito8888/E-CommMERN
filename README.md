# 🌐 Projet MERN : Construire un site E-Commerce épique

Bienvenue dans ce projet passionnant de création d'un site e-commerce ! Ce projet utilise la stack MERN (MongoDB, Express, React, Node.js) pour créer une plateforme e-commerce robuste et évolutive.

## 📝 Description du Projet
Ce projet a pour objectif de construire un site e-commerce complet et puissant, capable de gérer des milliers de produits et d’utilisateurs, en s'appuyant sur les meilleures pratiques en matière de développement web. À travers cette aventure, j'apprends à concevoir une architecture web robuste et évolutive, intégrant toutes les fonctionnalités nécessaires pour rivaliser avec les plus grands sites e-commerce du marché.

## 🚀 Fonctionnalités Clés

### 🔹 Authentification et Sécurité
- **Authentification sécurisée avec JWT** : Système d'authentification utilisant des tokens JSON Web Token (JWT) pour garantir la sécurité des utilisateurs.
- **Gestion des utilisateurs** : Inscription, connexion et gestion des informations utilisateur, avec validation des tokens JWT.
  
### 🔹 Gestion des Produits et Commandes
- **Catalogue dynamique de produits** : Les produits sont affichés en temps réel grâce à une intégration avec l'API **FakeStoreAPI**.
- **Gestion des paniers** : Fonctionnalité permettant à l'utilisateur d'ajouter, de modifier et de supprimer des produits dans son panier.
- **Traitement des commandes** : L'utilisateur peut finaliser ses achats via un processus de commande fluide.

### 🔹 Intégration de Paiement
- **Paiements sécurisés via Stripe** : Intégration de la passerelle de paiement Stripe pour sécuriser les transactions des utilisateurs.
  
### 🔹 Tableau de Bord Administrateur
- **Interface d'administration** : Un tableau de bord permettant à l'administrateur de créer, modifier et supprimer des produits.
- **Mise à jour des produits** : L'administrateur peut ajouter de nouveaux produits et gérer les informations existantes (prix, description, images, etc.).

### 🔹 Gestion d'État avec Redux
- **RTK Query** : Utilisation de **Redux Toolkit (RTK Query)** pour la gestion de l'état de l'application, permettant de simplifier les appels API et le stockage des données dans le Redux store.

### 🔹 Interface Utilisateur
- **Frontend réactif avec React** : L'interface utilisateur est construite avec **React.js**, permettant une expérience dynamique et réactive.
- **Composants modulaires** : Utilisation de composants React pour une gestion claire et réutilisable de l'interface.

### 🔹 Fonctionnalités supplémentaires
- **Filtrage des produits** : Un système de filtres avancés permettant de rechercher facilement parmi les produits disponibles.
- **Recommandations personnalisées** : Suggestions de produits adaptées aux préférences des utilisateurs, améliorant l'expérience d'achat.

## 🔧 Technologies et Outils Utilisés

- **MongoDB** : Base de données NoSQL utilisée pour stocker les données utilisateurs et produits.
- **Express.js** : Framework backend léger et flexible, utilisé pour créer l'API et gérer les routes du serveur.
- **React.js** : Bibliothèque JavaScript pour construire des interfaces utilisateurs dynamiques et réactives.
- **Node.js** : Environnement d'exécution JavaScript pour le développement backend.
- **Redux** : Gestion de l'état global de l'application avec Redux, incluant **RTK Query** pour simplifier les appels API.
- **JWT** : Utilisation des JSON Web Tokens pour une authentification sécurisée.
- **Stripe** : Intégration de la plateforme de paiement Stripe pour sécuriser les transactions.
- **Sass** : Utilisation de **Sass** pour écrire des styles CSS plus modulaires et maintenables.
- **FakeStoreAPI** : API externe utilisée pour simuler des données de produits afin d'enrichir l'expérience utilisateur.
