import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger, errorLogger } from './middlewares/logger';
import * as db from './queries';

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 мин
  max: 100, // максимум 100 обращений
});

const { PORT } = process.env;

app.use(cors({
  origin: [
    'http://localhost:5432',
  ],
}));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(requestLogger); // логгер запросов

app.use(limiter);

app.get('/', db.getHistory);
app.get('/user', db.getUserHistory);
app.get('*', (_: Request, res: Response) => {
  return res.status(404).send('Invalid Page');
});

app.use(errorLogger); // логгер ошибок

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
