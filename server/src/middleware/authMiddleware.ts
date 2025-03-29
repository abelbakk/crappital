import { Request, Response, NextFunction } from 'express';
import { AUTH_ERRORS, GENERAL_ERRORS } from '../utils/errorHandler';
import { IUser } from '../model/User';

export const isAuthenticated = (req: Request, _: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
    }
    next();
};

export const isAdmin = (req: Request, _: Response, next: NextFunction) => {
    if (!req.user || !(req.user as IUser).isAdmin) {
        return next({ status: 403, code: AUTH_ERRORS.NOT_ADMIN });
    }
    next();
};

export const isSelfOrAdmin = (getResourceUserId: (req: Request) => string) => {
    return (req: Request, _: Response, next: NextFunction) => {
        const requestUser = req.user as IUser;
        const userId = getResourceUserId(req);

        if (!userId) {
            return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
        }

        if (!(requestUser._id?.toString() === userId || requestUser.isAdmin)) {
            return next({ status: 403, code: AUTH_ERRORS.FORBIDDEN });
        }
        next();
    };
};
