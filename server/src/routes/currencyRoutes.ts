import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AUTH_ERRORS, GENERAL_ERRORS } from '../utils/errorHandler';
import { Currency } from '../model/Currency';
import { convertCurrency, updateExchangeRates } from '../services/currencyService';

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
     *         description: Unauthorized, user not authenticated
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
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }
        Currency.find()
            .lean()
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
     *         description: Unauthorized, user not authenticated
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
    router.put('/', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

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
     *         description: Bad request, invalid or missing query parameters
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
     *                   example: "GENERAL_ERRORS_MISSING_REQUEST_PARAMETERS"
     *       401:
     *         description: Unauthorized, user not authenticated
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
    router.get('/convert', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }
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
