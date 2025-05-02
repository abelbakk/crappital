import { Router, Request, Response, NextFunction } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';
import { getUnapprovedUsers, approveUser, restrictUser, getPendingTransactions, approveTransaction, rejectTransaction } from '../services/adminService';
import { GENERAL_ERRORS } from '../utils/errorHandler';
import logger from '../utils/logger';
import { User } from '../model/User';

export const adminRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/admin/users/unapproved:
     *   get:
     *     summary: List unapproved users
     *     description: Returns a list of all users that haven't been approved yet. Only accessible by admins.
     *     tags: [Admin]
     *     responses:
     *       200:
     *         description: List of unapproved users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserInfo'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/users/unapproved', isAuthenticated, isAdmin, async (_: Request, res: Response, next: NextFunction) => {
        try {
            const users = await getUnapprovedUsers();
            res.status(200).json(users);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/users/{userId}/approve:
     *   put:
     *     summary: Approve a user
     *     description: Approves a user's account, allowing them to use the app. Only accessible by admins.
     *     tags: [Admin]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user to approve
     *     responses:
     *       200:
     *         description: User approved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserInfo'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/users/:userId/approve', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await approveUser(req.params.userId);
            if (!user) {
                return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
            }
            res.status(200).json(user);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/users/{userId}/restrict:
     *   put:
     *     summary: Restrict a user
     *     description: Temporarily restricts a user's access to the platform until a specified date. Only accessible by admins.
     *     tags: [Admin]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user to restrict
     *       - in: query
     *         name: until
     *         required: true
     *         schema:
     *           type: string
     *           format: date-time
     *         description: The date until which the user should be restricted
     *     responses:
     *       200:
     *         description: User restricted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserInfo'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/users/:userId/restrict', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { until } = req.query;
            if (!until) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }

            const cleanedUntil = (until as string).replace(/^"|"$/g, '');
            const untilDate = new Date(cleanedUntil);
            if (isNaN(untilDate.getTime())) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }

            const user = await restrictUser(req.params.userId, untilDate);
            if (!user) {
                return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
            }
            res.status(200).json(user);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/transactions/pending:
     *   get:
     *     summary: Get pending transactions
     *     description: Returns a list of all transactions that require admin approval. Only accessible by admins.
     *     tags: [Admin]
     *     responses:
     *       200:
     *         description: List of pending transactions
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Transaction'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/transactions/pending', isAuthenticated, isAdmin, async (_: Request, res: Response, next: NextFunction) => {
        try {
            const transactions = await getPendingTransactions();
            res.status(200).json(transactions);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/transactions/{transactionId}/approve:
     *   put:
     *     summary: Approve a transaction
     *     description: Approves a pending transaction, completing the transfer of funds. Only accessible by admins.
     *     tags: [Admin]
     *     parameters:
     *       - in: path
     *         name: transactionId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the transaction to approve
     *     responses:
     *       200:
     *         description: Transaction approved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Transaction'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/transactions/:transactionId/approve', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transaction = await approveTransaction(req.params.transactionId);
            res.status(200).json(transaction);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/transactions/{transactionId}/reject:
     *   put:
     *     summary: Reject a transaction
     *     description: Rejects a pending transaction, returning the funds to the source account. Only accessible by admins.
     *     tags: [Admin]
     *     parameters:
     *       - in: path
     *         name: transactionId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the transaction to reject
     *     responses:
     *       200:
     *         description: Transaction rejected successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Transaction'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/transactions/:transactionId/reject', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transaction = await rejectTransaction(req.params.transactionId);
            res.status(200).json(transaction);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/admin/users:
     *   get:
     *     summary: Get all users
     *     description: Returns a list of all registered users. Only accessible by admins.
     *     tags: [Admin]
     *     responses:
     *       200:
     *         description: Successfully retrieved the list of users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserInfo'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/users', isAuthenticated, isAdmin, (_: Request, res: Response, next: NextFunction) => {
        User.find()
            .select('-password')
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((error) => {
                logger.error(error);
                next({ status: 500 });
            });
    });

    return router;
};
