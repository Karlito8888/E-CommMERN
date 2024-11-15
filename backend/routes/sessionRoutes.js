// backend/routes/sessionRoutes.js

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import logger from '../utils/logger.js';
import { SessionService } from '../services/sessionService.js';

const router = express.Router();

// Initialiser le service de session
const getSessionService = (req) => new SessionService(req.sessionStore);

// Route pour tester l'état de la session
router.get('/status', authenticate, (req, res) => {
    const sessionService = getSessionService(req);
    const sessionInfo = sessionService.getSessionInfo(req.session);
    res.json(sessionInfo);
});

// Route pour régénérer la session manuellement
router.post('/regenerate', authenticate, async (req, res) => {
    try {
        const sessionService = getSessionService(req);
        const result = await sessionService.regenerateSession(req.session);
        res.json({ 
            message: 'Session régénérée avec succès',
            ...result
        });
    } catch (error) {
        logger.error('Error in session regeneration:', error);
        res.status(500).json({ message: 'Erreur lors de la régénération de la session' });
    }
});

// Route pour nettoyer la session
router.post('/cleanup', authenticate, async (req, res) => {
    try {
        const sessionService = getSessionService(req);
        await sessionService.cleanSession(req.session);
        res.json({ message: 'Session nettoyée avec succès' });
    } catch (error) {
        logger.error('Error cleaning session:', error);
        res.status(500).json({ message: 'Erreur lors du nettoyage de la session' });
    }
});

// Route pour invalider toutes les sessions d'un utilisateur
router.post('/invalidate-all', authenticate, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const sessionService = getSessionService(req);
        await sessionService.invalidateUserSessions(userId);
        res.json({ message: 'Toutes les sessions ont été invalidées' });
    } catch (error) {
        logger.error('Error invalidating sessions:', error);
        res.status(500).json({ message: 'Erreur lors de l\'invalidation des sessions' });
    }
});

// Route pour obtenir les statistiques des sessions
router.get('/stats', authenticate, async (req, res) => {
    try {
        const sessionService = getSessionService(req);
        const stats = await sessionService.getSessionStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error getting session stats:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

export default router;
