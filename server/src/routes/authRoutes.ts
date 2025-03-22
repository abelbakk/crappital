import { PassportStatic } from 'passport';
import { IUser } from '../model/User';
import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AUTH_ERRORS } from '../utils/errorHandler';

export const authRoutes = (passport: PassportStatic, router: Router): Router => {
    /**
     * @swagger
     * /core/auth/status:
     *   get:
     *     summary: Check authentication status
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User is authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 authenticated:
     *                   type: boolean
     *                   example: true
     *       401:
     *         description: User is not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 authenticated:
     *                   type: boolean
     *                   example: false
     */
    router.get('/status', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.status(200).json({ authenticated: true });
        }
        res.status(401).json({ authenticated: false });
    });

    /**
     * @swagger
     * /core/auth/session:
     *   post:
     *     summary: Authenticate user and create a session
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "user@example.com"
     *               password:
     *                 type: string
     *                 format: password
     *                 example: "securepassword"
     *     responses:
     *       200:
     *         description: Successfully authenticated user, returning the user id
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userId:
     *                   type: string
     *                   example: "60d0fe4f5311236168a109ca"
     *       400:
     *         description: Invalid credentials or user not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_USER_NOT_FOUND"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     */
    router.post('/session', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (error: string | null, user: IUser) => {
            if (error) {
                logger.error(error);
                return next({ status: 500 });
            }
            if (!user) {
                return next({
                    status: 400,
                    code: AUTH_ERRORS.USER_NOT_FOUND,
                });
            }
            req.login(user, (err: string | null) => {
                if (err) {
                    logger.error(err);
                    return next({ status: 500 });
                }
                res.status(200).json({ userId: user._id });
            });
        })(req, res, next);
    });

    /**
     * @swagger
     * /core/auth/session:
     *   delete:
     *     summary: Logout user and destroy session
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Successfully logged out
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       401:
     *         description: User is not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 401
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_AUTHENTICATED"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     */
    router.delete('/session', (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        req.logout((err) => {
            if (err) {
                logger.error(err);
                return next({ status: 500 });
            }
            res.status(200).json({ success: true });
        });
    });

    return router;
};
