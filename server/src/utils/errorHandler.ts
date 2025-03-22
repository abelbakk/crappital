import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
    status?: number;
    code?: string;
}

export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'AUTH_ERRORS_INVALID_CREDENTIALS',
    USER_NOT_FOUND: 'AUTH_ERRORS_USER_NOT_FOUND',
    NOT_AUTHENTICATED: 'AUTH_ERRORS_NOT_AUTHENTICATED',
    NOT_ADMIN: 'AUTH_ERRORS_NOT_ADMIN',
    FORBIDDEN: 'AUTH_ERRORS_FORBIDDEN',
};

export const USER_ERRORS = {
    DUPLICATE_EMAIL: 'USER_ERRORS_DUPLICATE_EMAIL',
    PASSWORD_MISMATCH: 'USER_ERRORS_PASSWORD_MISMATCH',
};

export function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction) {
    const status = err.status || 500;
    const errorCode = err.code || 'UNKNOWN_ERROR';

    if (!res.headersSent) {
        res.status(status).json({
            status,
            error: errorCode,
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
}
