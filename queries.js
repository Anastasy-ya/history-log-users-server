const { Pool } = require('pg');

require('dotenv').config();

const { USER, HOST, PASSWORD, DATABASE, } = process.env;
const DATABASE_URL = 'postgresql://' + USER + ':' + PASSWORD + '@' + HOST + '/' + DATABASE + '?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  //временное решение до подключения ssl сертификата
  ssl: {
    rejectUnauthorized: false,
  },
});

// Обработка ошибок подключения к базе данных
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Завершение процесса в случае непредвиденной ошибки
});

// Функция для получения истории изменения всех пользователей
const getHistory = (_, response) => {
  pool.query('SELECT * FROM user_changes ORDER BY action_id ASC', (error, results) => {
    if (error) {
      console.error('Database query error', error);
      // Установить статус 500 в случае ошибки базы данных и отправить сообщение об ошибке
      return response.status(500).send('An error occurred while fetching users');
    }
    response.status(200).json(results.rows);
  });
};

const getUserHistory = (request, response) => {
  const id = request.query.id;

  if (!id) {
    return response.status(400).send('User ID is required');
  }

  pool.query('SELECT * FROM user_changes WHERE user_id = $1 ORDER BY action_id ASC', [id], (error, results) => {
    if (error) {
      console.error('Database query error', error);
      // Установить статус 500 в случае ошибки базы данных и отправить сообщение об ошибке
      return response.status(500).send('An error occurred while fetching user history');
    }

    if (results.rows.length === 0) {
      // Установить статус 404, если пользователь с указанным ID не найден
      return response.status(404).send(`User didn't change or doesn't exist`);
    }

    response.status(200).json(results.rows);
  });
};
module.exports = { getHistory, getUserHistory };


