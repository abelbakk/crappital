import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { GENERAL_ERRORS } from '../utils/errorHandler';
import { Currency } from '../model/Currency';
import { convertCurrency, updateExchangeRates } from '../services/currencyService';
import { isAdmin, isAuthenticated } from '../middleware/authMiddleware';

export const currencyRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /currencies:
     *   get:
     *     summary: Retrieve available currencies
     *     description: Returns a list of all available currencies that the server handles.
     *     tags:
     *       - Currencies
     *     responses:
     *       200:
     *         description: A list of available currencies
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CurrencyInfo'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/', isAuthenticated, async (_: Request, res: Response, next: NextFunction) => {
        Currency.find()
            .then((currencies) => {
                const currencyInfo = currencies.map(({ exchangeRates, ...currencyInfo }) => currencyInfo);
                res.status(200).json(currencyInfo);
            })
            .catch((error) => {
                logger.error(error);
                next({ status: 500 });
            });
    });

    /**
     * @swagger
     * /currencies:
     *   put:
     *     summary: Manually update exchange rates
     *     description: Fetches and updates the latest exchange rates from the European Central Bank.
     *     tags:
     *       - Currencies
     *     responses:
     *       200:
     *         description: Exchange rates updated successfully
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/', isAuthenticated, isAdmin, async (_: Request, res: Response, next: NextFunction) => {
        try {
            await updateExchangeRates();
            res.status(200).send();
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /currencies/convert:
     *   get:
     *     summary: Convert currency
     *     description: Converts an amount from one currency to another using the stored exchange rates.
     *     tags:
     *       - Currencies
     *     parameters:
     *       - in: query
     *         name: from
     *         schema:
     *           type: string
     *         required: true
     *         description: The currency code to convert from (e.g., USD or usd)
     *       - in: query
     *         name: to
     *         schema:
     *           type: string
     *         required: true
     *         description: The currency code to convert to (e.g., EUR or eur)
     *       - in: query
     *         name: amount
     *         schema:
     *           type: number
     *         required: true
     *         description: The amount to convert
     *     responses:
     *       200:
     *         description: The converted amount
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 result:
     *                   type: number
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/convert', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { from, to, amount } = req.query;
            if (!from || !to || !amount) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }
            const exchangedAmount = await convertCurrency(from as string, to as string, amount as string);
            res.status(200).json({ result: exchangedAmount });
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    return router;
};
