Login for this project has been taken from the project "passport-node-js" in my repository

in some html there is an input with an attribute "type = "file"" which means that there is enough to display button which will allow to
load some files to your server. More of other data is to just make it correctly and continue to work with this file
Загрузчик файлов работает с помощью formdata запросов. 
( https://xdan.ru/working-with-files-in-javascript-part-1-the-basics.html , https://wp-kama.ru/id_9026/jquery-ajax-zagruzka-fajlov-na-server.html)

HOW TO LAUNCH THIS APP:


Way to start this application:

1)Do NOT forget to nvm use 12 and "npm i" - it will install all dependencies from the package.json.
2) Before starting app - start mysql server from the terminal in the nodeApi folder with using of 
"mysql.server start"
3)After it login to mySql
sudo mysql -u root -p
   Ввести пароль "MAC"(запуск super user)
   а а затем пароль базы данных "password" - is a real password)
4) After it use this command for start application:
node fileUploadingVersionThreeLogin




Problem solving:
Problem solving with starting app (related to mysql.server has not been started)

1) Описание проблемы:
По какой-то причине запуск node fileUploadingVersionThreeLogin падает

Ошибка "events.js:287
              throw er; // Unhandled 'error' event
              ^
        
        Error: connect ECONNREFUSED 127.0.0.1:3306
"
3306 - это порт mysql, значит проблемы с базой данных

Проблема в том что перед запуском приложения необходимо использовать команду "mysql.server start"


2) РЕШЕНИЕ!!!
1.Запустить mysql командой(Нужно запустить MySql командой в отдельном терминале и потом запускать приложение через node appName.js):
  mysql.server start (PLEASE PAY ATTENTION TO HOW IT WROTE )
2. приконектится к базе данных, используя:
   sudo mysql -u root -p
   Ввести пароль "MAC"(запуск super user)
   а а затем пароль базы данных "password" - is a real password)
3.После этого запускать node-приложение через node команду

Problem solving № 2:
Problem solving with sql error during inserting some data to database (The error is "The MySQL server is running with the --secure-file-priv option")
1) Описание проблемы: Проблема проявлялась при запуске запроса 
"LOAD DATA INFILE '/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/excelAutomation.xlsx' INTO TABLE excel FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '
' (date, region, brand, state, cost, sales);
2) РЕШЕНИЕ!!!
1. С рабочего стола в терминале запустить команду
sudo vim /etc/my.cnf
2.Вставить туда такие данные
[mysqld_safe]
[mysqld]
secure_file_priv=""
ПОСЛЕДНЯЯ СТРОКА ТАК ЖЕ МОЖЕТ БЫТЬ: secure_file_priv="null"
Создание такого файла - влияет на всю операционную систему и где бы не запускался mysql - это должно на mysql влиять.
Найдено решение здесь: https://stackoverflow.com/questions/32737478/how-should-i-tackle-secure-file-priv-in-mysql
Так же добавил более детально в свой google docs:
https://docs.google.com/document/d/1p9GFGQI2qgkXLiyJYi5os4YTM0KrF5dqn4Mo9qVZVXs/edit

Problem solving №3:
Problem solving with sql error during inserting some data to database (The error is "“Invalid utf8mb4 character string:")
1) Описание проблемы: Проблема проявлялась при запуске запроса
connection.query("LOAD DATA INFILE '/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/excelAutomation.xlsx' INTO TABLE excel CHARACTER SET utfmb4 (region, brand, state, cost, sales);",function (error, result) {
И
connection.query("LOAD DATA INFILE '/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/excelAutomation.xlsx' INTO TABLE excel (region, brand, state, cost, sales);",function (error, result) {
2) РЕШЕНИЕ!!!
set names latin 1; - in mysql terminal
AND
user query like this: connection.query("LOAD DATA INFILE '/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/excelAutomation.xlsx' INTO TABLE excel CHARACTER SET latin1 (region, brand, state, cost, sales);",function (error, result) {



Взято отсюда: https://dzone.com/articles/mysql-57-utf8mb4-and-the-load-data-infile



https://expressjs.com/en/guide/writing-middleware.html - guide на этом сайте дает готовые решение как например использовать cookiesValidator.


https://coderoad.ru/11944932/%D0%9A%D0%B0%D0%BA-%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C-%D1%84%D0%B0%D0%B9%D0%BB-%D1%81-Node-js-%D0%B1%D0%B5%D0%B7-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D0%BD%D0%B8%D1%85-%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA
- как скачать файл
https://www.youtube.com/watch?v=ogF_WMzUqok - еще видео как скчаать файл
https://coderoad.ru/13292101/%D0%9F%D0%B5%D1%80%D0%B5%D0%BC%D0%B5%D1%89%D0%B5%D0%BD%D0%B8%D0%B5-%D1%84%D0%B0%D0%B9%D0%BB%D0%BE%D0%B2-%D1%81-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E-node-js  - как написать код который переместит файл из одной папки в другую


Also drag and drop files may be used there( https://xdan.ru/working-with-files-in-javascript-part-1-the-basics.html ) 
Taken from there https://www.youtube.com/watch?v=ymO_r1hcIXk


https://www.youtube.com/watch?v=Zyb0G8ADmSs - обзор express app
https://www.youtube.com/watch?v=lY6icfhap2o - express middleware

Returning file from NODE JS:
https://www.youtube.com/watch?v=3a9S3wubxLw
https://gist.github.com/prof3ssorSt3v3/96e6b29cd5baf4aeaad29a93fd3c7ed5 - this is just simply about how to exposed file on the page
not about how top download it

This is exactly about downloading this file: https://www.youtube.com/watch?v=dc0_tQ9fGAU

https://www.youtube.com/watch?v=9vkqo7nL9vk - learn more about this
https://www.youtube.com/watch?v=8EB21rhsbJU - learn more about this
https://www.youtube.com/watch?v=0oTXT0n2p4I - learn more about this
https://www.youtube.com/watch?v=srPXMt1Q0nY - also this
