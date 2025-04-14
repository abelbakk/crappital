import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { GENERAL_ERRORS } from '../utils/errorHandler';
import { getAllAccounts, getAccountById, createAccount, updateAccountById, deleteAccountById, getUserId } from '../services/accountService';
import { isAuthenticated, isSelfOrAdmin } from '../middleware/authMiddleware';

export const accountRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/accounts/{userId}:
     *   get:
     *     summary: List all user accounts
     *     tags: [Accounts]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user whose accounts to retrieve
     *     responses:
     *       200:
     *         description: A list of user accounts
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Account'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get(
        '/:userId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const accounts = await getAllAccounts(getUserId(req));
                res.status(200).json(accounts);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/accounts/{userId}/{accountId}:
     *   get:
     *     summary: Get a specific account
     *     tags: [Accounts]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user whose accounts to retrieve
     *       - in: path
     *         name: accountId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the account to retrieve
     *     responses:
     *       200:
     *         description: Account details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Account'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get(
        '/:userId/:accountId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            const accountId = req.params.accountId;
            if (!accountId) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }
            try {
                const account = await getAccountById(req.params.accountId);
                if (!account) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }
                res.status(200).json(account);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/accounts:
     *   post:
     *     summary: Create a new account
     *     tags: [Accounts]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - currency
     *             properties:
     *               userId:
     *                 type: string
     *               name:
     *                 type: string
     *               currency:
     *                 type: string
     *     responses:
     *       201:
     *         description: Account created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.post('/', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
        const { userId, currency } = req.body;
        if (!userId || !currency) {
            return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
        }
        try {
            const account = await createAccount(req.body);
            res.status(201).json(account);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/accounts/{userId}/{accountId}:
     *   put:
     *     summary: Update account details
     *     tags: [Accounts]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user whose account to update
     *       - in: path
     *         name: accountId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the account to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *     responses:
     *       200:
     *         description: Account updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put(
        '/:userId/:accountId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            const accountId = req.params.accountId;
            if (!accountId) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }
            try {
                const updatedAccount = await updateAccountById(accountId, req.body);
                if (!updatedAccount) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }
                res.status(200).json(updatedAccount);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/accounts/{userId}/{accountId}:
     *   delete:
     *     summary: Close an account
     *     tags: [Accounts]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user whose accounts to delete
     *       - in: path
     *         name: accountId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the account to delete
     *     responses:
     *       200:
     *         description: Account deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Account deleted successfully"
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.delete(
        '/:userId/:accountId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const deletedAccount = await deleteAccountById(req.params.accountId);
                if (!deletedAccount) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }
                res.status(200).json({ message: 'Account deleted successfully' });
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/accounts/{userId}/{accountId}/balance:
     *   put:
     *     summary: Deposit balance to account
     *     description: Adds the specified amount to the account's current balance
     *     tags: [Accounts]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user whose account to update
     *       - in: path
     *         name: accountId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the account to deposit to
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - balance
     *             properties:
     *               balance:
     *                 type: number
     *                 description: Amount to deposit
     *                 example: 5000
     *     responses:
     *       200:
     *         description: Account balance updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Account'
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
    router.put(
        '/:userId/:accountId/balance',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            const { accountId } = req.params;
            const { balance } = req.body;

            if (!accountId || balance === undefined) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }

            if (typeof balance !== 'number' || balance <= 0) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }

            try {
                const account = await getAccountById(accountId);
                if (!account) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }

                account.balance += balance;
                await account.save();
                res.status(200).json(account);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    return router;
};
