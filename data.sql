CREATE DATABASE IF NOT EXISTS users DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;


/*Как было в nodeAPI проекте
CREATE TABLE tasks (
id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
description VARCHAR(64) NOT NULL,
completed TINYINT(1) NOT NULL DEFAULT 0,
created DATETIME NOT NULL DEFAULT NOW(),
last_updated DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()
);
 */

/*Как есть сейчас
  Но перед работой необходимо вручную создать базу данных "users"
  */
CREATE TABLE IF NOT EXISTS credentials (
id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(30) NOT NULL,
username VARCHAR(30) NOT NULL,
password_hash VARCHAR(100) NOT NULL,
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS media (
id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
file_name VARCHAR(30) NOT NULL,
file LONGBLOB NOT NULL);


/* Excel таблица - запрос до изменения
CREATE TABLE IF NOT EXISTS excel (
id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
region LONGTEXT NOT NULL,
brand LONGTEXT NOT NULL,
state LONGTEXT NOT NULL,
cost LONGTEXT NOT NULL,
sales LONGTEXT NOT NULL,
);
*/

/* Excel таблица - запрос после изменений
   Я решил колонку ID сделать не как авто-инкремент, а как поле которые вставляем из документа.
   Причина в том - что если мы из документа вставляем МНОГО рядов - и стоит id autoincrement - эти данные не будут вставляться -
   а вставлен в базу данных будет только один ряд и один id который auto-increment.
   А если мы будем вставлять id и другие поля из excel или csv файла - то сколько бы рядов не было в документе - все они будут вставлены
   в своем количестве и с айдишником который из документа
   */
CREATE TABLE IF NOT EXISTS excel (
id INT(5) NOT NULL,
added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
region LONGTEXT NOT NULL,
brand LONGTEXT NOT NULL,
state LONGTEXT NOT NULL,
cost LONGTEXT NOT NULL,
sales LONGTEXT NOT NULL,
);