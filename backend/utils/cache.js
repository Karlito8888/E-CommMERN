import NodeCache from 'node-cache';

// Création d'une instance de cache avec une durée de vie par défaut de 10 minutes
const cache = new NodeCache({
    stdTTL: 600, // 10 minutes en secondes
    checkperiod: 120, // Vérifie les clés expirées toutes les 2 minutes
});

// Fonction pour obtenir une clé de cache standardisée
const getCacheKey = (prefix, params = {}) => {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
            acc[key] = params[key];
            return acc;
        }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
};

// Middleware de cache pour les routes Express
export const cacheMiddleware = (prefix, duration = 600) => {
    return async (req, res, next) => {
        // Création d'une clé unique basée sur la route et les paramètres
        const cacheKey = getCacheKey(prefix, {
            ...req.params,
            ...req.query,
            ...req.body
        });

        try {
            // Vérifier si les données sont en cache
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                return res.json(cachedData);
            }

            // Modifier la méthode json de res pour intercepter et mettre en cache la réponse
            const originalJson = res.json;
            res.json = function(data) {
                cache.set(cacheKey, data, duration);
                originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Cache error:', error);
            next();
        }
    };
};

// Fonction pour invalider le cache pour un préfixe donné
export const invalidateCache = (prefix) => {
    const keys = cache.keys();
    const prefixKeys = keys.filter(key => key.startsWith(prefix));
    cache.del(prefixKeys);
};

// Fonction pour mettre en cache des données manuellement
export const setCacheData = (key, data, ttl = 600) => {
    return cache.set(key, data, ttl);
};

// Fonction pour récupérer des données du cache manuellement
export const getCacheData = (key) => {
    return cache.get(key);
};

export default {
    cacheMiddleware,
    invalidateCache,
    setCacheData,
    getCacheData,
};
