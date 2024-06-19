# history-log-users-server

_Изучение облачной базы данных и синтаксиса postgresql_

_Является частью проекта postgresqlProject_

## Используется облачная база данных postgresql neon.tech

_Для подключения необходим .env файл в корневой директории приложения:_

```
USER=<your_login>

HOST=<your-host>

DATABASE=<db-name>

PASSWORD=<password>

PORT=5432
```


Строка, содержащая данные для подключения, располагается в Dashboard панели управления

```
postgres://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname
           ^    ^         ^                                               ^
     role -|    |         |- hostname                                     |- database
                |
                |- password

```

[Документация](https://neon.tech/docs/get-started-with-neon/connect-neon "Переход на сайт neon.tech")

### Скрипт для создания SQL-таблицы и заполнения ее рандомными значениями: 

```
-- Создание таблицы users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name CHAR(3) NOT NULL,
    last_name CHAR(3) NOT NULL,
    age INT CHECK (age BETWEEN 18 AND 100),
    gender CHAR(1) CHECK (gender IN ('m', 'f')),
    problems BOOLEAN
);

-- Функция для генерации случайной строки заданной длины
CREATE OR REPLACE FUNCTION random_string(length INT) RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..length LOOP
        result := result || CHR(65 + FLOOR(RANDOM() * 26)::INT);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации случайного возраста
CREATE OR REPLACE FUNCTION random_age() RETURNS INT AS $$
BEGIN
    RETURN FLOOR(RANDOM() * 83) + 18;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации случайного пола
CREATE OR REPLACE FUNCTION random_gender() RETURNS CHAR(1) AS $$
BEGIN
    RETURN CASE WHEN RANDOM() < 0.5 THEN 'm' ELSE 'f' END;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации случайного значения для проблемы
CREATE OR REPLACE FUNCTION random_problems() RETURNS BOOLEAN AS $$
BEGIN
    RETURN RANDOM() < 0.5;
END;
$$ LANGUAGE plpgsql;

-- Функция для вставки случайного пользователя
CREATE OR REPLACE FUNCTION insert_random_person(num_users INT) RETURNS VOID AS $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..num_users LOOP
        INSERT INTO users (first_name, last_name, age, gender, problems)
        VALUES (random_string(3), random_string(3), random_age(), random_gender(), random_problems());
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Вставка пользователей
SELECT insert_random_person(1000);
```

### Cкрипт для создания связанной таблицы с историей изменения первой таблицы

```
CREATE TABLE user_changes (
  action_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action_date TIMESTAMP NOT NULL,
  action VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
```

## Запуск
git clone git@github.com:Anastasy-ya/postgresqlProject.git
<br>
cd postgresqlProject
<br>
npm install
<br>
npm start

## Проверка

### get users:

GET http://localhost:5432

### 404:

GET http://localhost:5432/sdfg
