import { PassportStatic } from 'passport';
import { IUser } from '../model/User';
import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AUTH_ERRORS } from '../utils/errorHandler';
import { isAuthenticated } from '../middleware/authMiddleware';

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
     *               $ref: '#/components/schemas/UserInfo'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     */
    router.get('/status', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const { password, ...userInfo } = req.user as IUser;
            res.status(200).json(userInfo);
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
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 404
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_USER_NOT_FOUND"
     *       401:
     *         description: Invalid credentials
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
     *                   example: "AUTH_ERRORS_INVALID_CREDENTIALS"
     *       403:
     *         description: User not approved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 403
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_USER_NOT_APPROVED"
     *       423:
     *         description: User account restricted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 423
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_USER_ACCOUNT_RESTRICTED"
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.post('/session', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (error: string | null, user: IUser, info: any) => {
            if (error) {
                logger.error(error);
                return next({ status: 500 });
            }
            if (!user) {
                if (info?.message === 'Invalid credentials') {
                    return next({
                        status: 401,
                        code: AUTH_ERRORS.INVALID_CREDENTIALS,
                        message: info.message,
                    });
                }
                if (info?.message === 'User not found') {
                    return next({
                        status: 404,
                        code: AUTH_ERRORS.USER_NOT_FOUND,
                        message: info.message,
                    });
                }
                return next({
                    status: 401,
                    code: AUTH_ERRORS.INVALID_CREDENTIALS,
                    message: 'Invalid credentials',
                });
            }
            req.login(user, (err: string | null) => {
                if (err) {
                    logger.error(err);
                    return next({ status: 500 });
                }
                if (!user.approved) {
                    return req.logout((err) => {
                        if (err) {
                            logger.error(err);
                            return next({ status: 500 });
                        }
                        return next({
                            status: 403,
                            code: AUTH_ERRORS.USER_NOT_APPROVED,
                        });
                    });
                }
                if (user.restricted) {
                    return req.logout((err) => {
                        if (err) {
                            logger.error(err);
                            return next({ status: 500 });
                        }
                        return next({
                            status: 423,
                            code: AUTH_ERRORS.USER_ACCOUNT_RESTRICTED,
                        });
                    });
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
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.delete('/session', isAuthenticated, (req: Request, res: Response, next: NextFunction) => {
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
