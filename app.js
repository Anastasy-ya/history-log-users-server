const express = require('express');

const rateLimit = require('express-rate-limit');

const bodyParser = require('body-parser');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 мин
  max: 100, // максимум 100 обращений
});

const db = require('./queries');

require('dotenv').config();

const { PORT } = process.env;

const cors = require('cors');

const { requestLogger, errorLogger } = require('./middlewares/logger');

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
app.get('*', (_, res) => {
  return res.status(404).send('Invalid Page');
});

app.use(errorLogger); // логгер ошибок

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});