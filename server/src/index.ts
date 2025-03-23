import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import logger from './utils/logger';
import { configurePassport } from './passport/passport';
import { errorHandler } from './utils/errorHandler';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';
import { setupSwagger } from './utils/swagger';
import { currencyRoutes } from './routes/currencyRoutes';
import { updateExchangeRates } from './services/currencyService';

dotenv.config();

const port = process.env.PORT || 5000;
const dbUsername = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || 'crappital';
const dbPort = process.env.DB_PORT || 27017;
const dbUrl = process.env.DB_URL || `mongodb://${dbUsername}:${dbPassword}@localhost:${dbPort}/crappital?authSource=admin`;
const app = express();
const sessionSecret = process.env.SESSION_SECRET || 'crappital-sesh';

mongoose
    .connect(dbUrl)
    .then((_) => {
        logger.info('Successfully connected to MongoDB');
    })
    .catch((error) => {
        logger.error(`Could not connect to MongoDB: ${error.message}`);
    });

app.use(bodyParser.json());
app.use(cookieParser());
const sessionOptions: expressSession.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
};
app.use(expressSession(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);
app.use('/core/users', userRoutes(express.Router()));
app.use('/core/auth', authRoutes(passport, express.Router()));
app.use('/core/currencies', currencyRoutes(express.Router()));
setupSwagger(app);
app.use(errorHandler);

updateExchangeRates();

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});
