// backend/middlewares/responseMiddleware.js

/**
 * Formatte une réponse utilisateur en ne retournant que les champs nécessaires
 */
export const formatUserResponse = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    shippingAddress: user.shippingAddress
  };
};

/**
 * Middleware pour formater toutes les réponses de l'API de manière cohérente
 */
export const formatResponse = () => {
  return (req, res, next) => {
    // Sauvegarder les méthodes originales
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Remplacer res.json
    res.json = function(data) {
      // Ne pas modifier les réponses d'erreur
      if (res.statusCode >= 400) {
        return originalJson.call(this, data);
      }
      
      // Si la réponse contient déjà success, on la laisse telle quelle
      if (data && typeof data === 'object' && 'success' in data) {
        return originalJson.call(this, data);
      }
      
      // Formater la réponse
      const formattedResponse = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      };

      return originalJson.call(this, formattedResponse);
    };
    
    // Remplacer res.send pour gérer les réponses non-JSON
    res.send = function(data) {
      // Si c'est déjà du JSON, utiliser res.json
      if (data && typeof data === 'object') {
        return res.json(data);
      }
      
      // Sinon utiliser send original
      return originalSend.call(this, data);
    };

    next();
  };
};
