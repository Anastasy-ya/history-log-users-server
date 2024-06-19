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

// Функция для получения истории изменения пользователей
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

module.exports = { getHistory };


