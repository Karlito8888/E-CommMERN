import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Formats personnalisés pour les logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} | ${level.toUpperCase()} | ${message}`;
        // Ajouter les métadonnées si présentes
        if (Object.keys(meta).length > 0) {
            log += ` | ${JSON.stringify(meta)}`;
        }
        // Ajouter la stack trace si présente
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    })
);

// Configuration des transports
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: customFormat,
    transports: [
        // Logs de debug et supérieurs dans la console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),

        // Logs d'erreur dans un fichier rotatif
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d', // Garde les logs pendant 14 jours
            maxSize: '20m', // Taille maximale de 20MB par fichier
        }),

        // Tous les logs dans un fichier rotatif
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
        })
    ]
});

// Fonctions utilitaires pour le logging
export const logInfo = (message, meta = {}) => logger.info(message, meta);
export const logError = (message, error) => logger.error(message, { error });
export const logWarning = (message, meta = {}) => logger.warn(message, meta);
export const logDebug = (message, meta = {}) => logger.debug(message, meta);

export default logger;
