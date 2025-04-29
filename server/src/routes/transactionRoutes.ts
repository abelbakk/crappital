import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ACCOUNT_ERRORS, GENERAL_ERRORS } from '../utils/errorHandler';
import { getAllTransactions, getTransactionById, createTransaction, updateTransactionById, deleteTransactionById } from '../services/transactionService';
import { isAuthenticated, isSelfOrAdmin } from '../middleware/authMiddleware';
import { getUserId } from '../services/accountService';
import { Account } from '../model/Account';

export const transactionRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/transactions/{userId}:
     *   get:
     *     summary: List all user transactions
     *     tags: [Transactions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of transactions
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
    router.get(
        '/:userId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const transactions = await getAllTransactions(getUserId(req));
                res.status(200).json(transactions);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/transactions/{userId}/{transactionId}:
     *   get:
     *     summary: Get specific transaction
     *     tags: [Transactions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *       - in: path
     *         name: transactionId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Transaction details
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
    router.get(
        '/:userId/:transactionId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const transaction = await getTransactionById(req.params.transactionId);
                if (!transaction) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }
                res.status(200).json(transaction);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/transactions:
     *   post:
     *     summary: Create a new transaction
     *     tags: [Transactions]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - fromAccountId
     *               - toAccountNumber
     *               - amount
     *               - currencyFrom
     *               - categoryId
     *             properties:
     *               fromAccountId:
     *                 type: string
     *               toAccountNumber:
     *                 type: string
     *               amount:
     *                 type: number
     *               currencyFrom:
     *                 type: string
     *               categoryId:
     *                 type: string
     *     responses:
     *       201:
     *         description: Transaction created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       404:
     *         description: Target account not found
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
     *                   example: "ACCOUNT_ERRORS_ACCOUNT_NOT_FOUND"
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.post('/', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const targetAccount = await Account.findOne({ number: req.body.toAccountNumber });
            if (!targetAccount) {
                return next({ status: 404, code: ACCOUNT_ERRORS.ACCOUNT_NOT_FOUND });
            }
            const request = {
                ...req.body,
                toAccountId: targetAccount._id,
            };
            const transaction = await createTransaction(request);
            res.status(201).json(transaction);
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/transactions/{userId}/{transactionId}:
     *   put:
     *     summary: Update transaction details
     *     description: Only pending transactions can be updated
     *     tags: [Transactions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *       - in: path
     *         name: transactionId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               amount:
     *                 type: number
     *               categoryId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Transaction updated successfully
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
        '/:userId/:transactionId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const updatedTransaction = await updateTransactionById(req.params.transactionId, req.body);
                if (!updatedTransaction) {
                    return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
                }
                res.status(200).json(updatedTransaction);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    /**
     * @swagger
     * /core/transactions/{userId}/{transactionId}:
     *   delete:
     *     summary: Cancel a transaction
     *     description: Only pending transactions can be cancelled
     *     tags: [Transactions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *       - in: path
     *         name: transactionId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Transaction cancelled successfully
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.delete(
        '/:userId/:transactionId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await deleteTransactionById(req.params.transactionId);
                res.status(200).json({ message: 'Transaction cancelled successfully' });
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    return router;
};
