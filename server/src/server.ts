import app from './app';
import mongoose from 'mongoose';
import logger from './utils/logger';

const port = process.env.PORT || 5000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/crappital';

mongoose
    .connect(dbUrl)
    .then((_) => {
        logger.info('Successfully connected to MongoDB');
    })
    .catch((error) => {
        logger.error(`Could not connect to MongoDB: ${error.message}`);
    });

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});
