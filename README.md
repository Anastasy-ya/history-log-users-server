# history-log-users-server

TypeScript - Express.js - cors - node-postgres - express-rate-limit

_Изучение облачной базы данных и синтаксиса postgresql_

# Сервис работает с табоицей user_changes и возвращает историю изменения user таблицы users

## Ссылки

https://github.com/Anastasy-ya/postgresqlProject
https://github.com/Anastasy-ya/history-log-users-server
https://github.com/Anastasy-ya/BigDB

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
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(3) NOT NULL,
    last_name VARCHAR(3) NOT NULL,
    age INT CHECK (age BETWEEN 18 AND 100),
    gender CHAR(1) CHECK (gender IN ('m', 'f')),
    problems BOOLEAN
);

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

CREATE OR REPLACE FUNCTION random_age() RETURNS INT AS $$
BEGIN
    RETURN FLOOR(RANDOM() * 83) + 18;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION random_gender() RETURNS CHAR(1) AS $$
BEGIN
    RETURN CASE WHEN RANDOM() < 0.5 THEN 'm' ELSE 'f' END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION random_problems() RETURNS BOOLEAN AS $$
BEGIN
    RETURN RANDOM() < 0.5;
END;
$$ LANGUAGE plpgsql;

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

DO $$
DECLARE
    batch_size INT := 10000;
    total_users INT := 1000000;
    batches INT := total_users / batch_size;
    i INT;
BEGIN
    FOR i IN 1..batches LOOP
        PERFORM insert_random_person(batch_size);
        COMMIT;
        RAISE NOTICE 'Inserted % batches of % records', i, batch_size;
    END LOOP;
END $$;

CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_problems ON users(problems);
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
npm run build
npm start

## Проверка

### get users:

GET http://localhost:5432

### get one user:

GET http://localhost:5432/user?id=200

### 404:

GET http://localhost:5432/sdfg

/user

