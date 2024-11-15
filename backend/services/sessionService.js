// backend/services/sessionService.js

import logger from '../utils/logger.js';

export class SessionService {
    constructor(sessionStore) {
        this.sessionStore = sessionStore;
    }

    // Obtenir les informations de base d'une session
    getSessionInfo(session) {
        return {
            id: session.id,
            created: session.created,
            lastAccess: session.lastAccess,
            user: session.user ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email
            } : null,
            cart: session.cart ? {
                totalItems: session.cart.totalItems,
                totalPrice: session.cart.totalPrice
            } : null
        };
    }

    // Régénérer une session en conservant les données importantes
    async regenerateSession(session) {
        const oldSessionId = session.id;
        const importantData = {
            user: session.user,
            cart: session.cart
        };

        return new Promise((resolve, reject) => {
            session.regenerate((err) => {
                if (err) {
                    logger.error('Error regenerating session:', err);
                    return reject(err);
                }

                Object.assign(session, importantData);
                session.created = Date.now();

                logger.info('Session regenerated', { 
                    oldSessionId, 
                    newSessionId: session.id 
                });

                resolve({
                    oldSessionId,
                    newSessionId: session.id
                });
            });
        });
    }

    // Nettoyer une session
    async cleanSession(session) {
        const sessionId = session.id;
        const essentialData = {
            user: session.user,
            cart: session.cart ? {
                items: session.cart.items,
                totalPrice: session.cart.totalPrice,
                totalItems: session.cart.totalItems
            } : null,
            created: session.created
        };

        return new Promise((resolve, reject) => {
            session.regenerate((err) => {
                if (err) {
                    logger.error('Error cleaning session:', err);
                    return reject(err);
                }

                Object.assign(session, essentialData);
                logger.info('Session cleaned', { sessionId });
                resolve(sessionId);
            });
        });
    }

    // Invalider toutes les sessions d'un utilisateur
    async invalidateUserSessions(userId) {
        return new Promise((resolve, reject) => {
            this.sessionStore.all((err, sessions) => {
                if (err) {
                    logger.error('Error fetching sessions:', err);
                    return reject(err);
                }

                const destroyPromises = Object.entries(sessions)
                    .filter(([_, session]) => session.user && session.user.id === userId)
                    .map(([sid]) => new Promise((resolveDestroy) => {
                        this.sessionStore.destroy(sid, (destroyErr) => {
                            if (destroyErr) {
                                logger.error(`Error destroying session ${sid}:`, destroyErr);
                            }
                            resolveDestroy();
                        });
                    }));

                Promise.all(destroyPromises)
                    .then(() => {
                        logger.info('All sessions invalidated for user', { userId });
                        resolve();
                    })
                    .catch(reject);
            });
        });
    }

    // Obtenir les statistiques des sessions
    async getSessionStats() {
        return new Promise((resolve, reject) => {
            this.sessionStore.all((err, sessions) => {
                if (err) {
                    logger.error('Error fetching sessions for stats:', err);
                    return reject(err);
                }

                const stats = {
                    totalSessions: 0,
                    activeSessions: 0,
                    userSessions: 0,
                    anonymousSessions: 0,
                    sessionsWithCart: 0,
                    averageCartSize: 0,
                    totalCartValue: 0
                };

                const now = Date.now();
                let totalCartItems = 0;

                Object.values(sessions).forEach(session => {
                    stats.totalSessions++;

                    if (session.lastAccess && (now - session.lastAccess) < 30 * 60 * 1000) {
                        stats.activeSessions++;
                    }

                    if (session.user) {
                        stats.userSessions++;
                    } else {
                        stats.anonymousSessions++;
                    }

                    if (session.cart?.items?.length > 0) {
                        stats.sessionsWithCart++;
                        totalCartItems += session.cart.items.length;
                        stats.totalCartValue += session.cart.totalPrice || 0;
                    }
                });

                stats.averageCartSize = stats.sessionsWithCart > 0 
                    ? totalCartItems / stats.sessionsWithCart 
                    : 0;

                logger.info('Session stats calculated', { 
                    totalSessions: stats.totalSessions,
                    activeSessions: stats.activeSessions 
                });

                resolve(stats);
            });
        });
    }
}
