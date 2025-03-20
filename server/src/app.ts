import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (_, res) => {
    res.send(`Server is running on port ${PORT}`);
});

export default app;
