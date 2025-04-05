import { Router, Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { GENERAL_ERRORS } from '../utils/errorHandler';
import { getSpendingStatistics } from '../services/statisticsService';
import { isAuthenticated, isSelfOrAdmin } from '../middleware/authMiddleware';

export const statisticsRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/statistics/spending/{userId}:
     *   get:
     *     summary: Get spending statistics by category
     *     tags: [Statistics]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: from
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: to
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: account
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Spending statistics grouped by category
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SpendingStatistics'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get(
        '/spending/:userId',
        isAuthenticated,
        isSelfOrAdmin((req) => req.params.userId),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { from, to, account } = req.query;
                if (!from || !to) {
                    return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
                }

                const fromDate = new Date(from as string);
                const toDate = new Date(to as string);

                if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                    return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
                }

                const stats = await getSpendingStatistics(new Types.ObjectId(req.params.userId), fromDate, toDate, account as string);
                res.status(200).json(stats);
            } catch (error) {
                logger.error(error);
                next({ status: 500 });
            }
        },
    );

    return router;
};
