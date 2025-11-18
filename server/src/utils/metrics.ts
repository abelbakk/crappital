import { Router, Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';
import logger from './logger';

collectDefaultMetrics();

export const metricsRoutes = (router: Router): Router => {
    router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        } catch (error) {
            logger.error(error);
            next({ status: 500 });
        }
    });

    return router;
};
