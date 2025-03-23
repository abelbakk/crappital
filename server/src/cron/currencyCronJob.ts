import cron from 'node-cron';
import { updateExchangeRates } from '../services/currencyService';
import logger from '../utils/logger';

cron.schedule('0 17 * * *', async () => {
    logger.info('Running daily currency update...');
    await updateExchangeRates();
    logger.info('Currency update complete.');
});
