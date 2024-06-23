import { Pool } from 'pg';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const { USER, HOST, PASSWORD, DATABASE } = process.env;
const DATABASE_URL = `postgresql://${USER}:${PASSWORD}@${HOST}/${DATABASE}?sslmode=require`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // временное решение до подключения ssl сертификата
  },
});

// Обработка ошибок подключения к базе данных
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Завершение процесса в случае непредвиденной ошибки
});

// Функция для получения истории изменения всех пользователей
export const getHistory = (_: Request, response: Response) => {
  pool.query('SELECT * FROM user_changes ORDER BY action_id ASC', (error, results) => {
    if (error) {
      console.error('Database query error', error);
      // Установить статус 500 в случае ошибки базы данных и отправить сообщение об ошибке
      return response.status(500).send('An error occurred while fetching users');
    }
    response.status(200).json(results.rows);
  });
};

// Функция для получения истории изменений конкретного пользователя
export const getUserHistory = (request: Request, response: Response) => {
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
