if (process.env.NODE_ENV !== 'production') {
    /**
     * Here we add our .env file
     */
    require('dotenv').config()
}

const express = require('express');
const upload = require('express-fileupload');
const fs = require("fs");
var url = require('url');
const path = require('path');
const download = require("download");
var ROOT = __dirname + "/downloads";
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const xlsx = require("xlsx");
const session = require('express-session');
const methodOverride = require('method-override');
const mysql = require('mysql2');
//const mysql = require('mysql2/promise');
/**
 * After start the server - you can download the file with using this url:
 * http://localhost:3000/newDataFile.xlsx?secret=o_O
 */

/**
 * Every of these express libraries should be installed. I mean "npm I express -D; npm I express-fileupload -D"
 * @type {*|Express}
 */
const app = express();
/**
 Это обычная а не promise версия соединения с mysql БД
 */
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'users'
});

try {
    connection.connect();
} catch(e) {
    console.log('Oops.Connection to MySql failed.');
    console.log(e);
}
 /*
 var userPassword = connection.query('SELECT password FROM credentials WHERE id = 7', (error, results) => {
 OR
   databaseUserPassword = connectionQueryPassword('SELECT password FROM credentials WHERE id = 7', (error, results) => {
        if (error) {
            console.log(error);
        } else {
            var userPassword = results[0].password;
            console.log(userPassword)
            return userPassword;
        }
    }
))

*/
        /**
         * Лучше не использовать toString так как вместо строки это вернет в нашем случае какой-то объект
         * return userPassword.toString();
         *
         * https://stackoverflow.com/questions/42373879/node-js-get-result-from-mysql-query - в статье написано
         * что я не могу получить объект за пределами запроса, могу получить его только в пределах запроса и это плохо
         *
         *
         *
         *
         *
         * Стоить обратить внимание на этот запрос
         * id => connectionQueryId('SELECT id FROM credentials WHERE id = ?', user=> user.id === id)
         * "user=> user.id === id" - это универсальная часть которая используется как с обычным массивом так и подходит даже
         * для поиска в базе данных. Этот запрос так же хорошо виден на странице passport-configWithSQL
         *
         * TODO: если эта хитрая конструкция работает для id и email - то я уверен что она должна будет так же элементарно сработать
         * TODO: для пароля. Но для начал нужно наладить работу всей функции логина
         * TODO: После сделать хранение данных в базе данных
         */


const initializePassport = require('./passport-configWithSQL')
initializePassport(
    passport,
    email => connectionQueryId('SELECT id FROM credentials WHERE email = ?', user=> user.email === email),
    email => connectionQueryEmail("SELECT email, password_hash FROM credentials WHERE email = ?", user=> user.email === email)
    )

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
/**
 * Функция Next - если она есть в запросе - то она вызывает именно следующую middleware функцию. Она не вызывает обычную функцию.
 * Только middleware(у которой есть запрос и ответ). Можно называть эту функцию любым именем, но чтобы не путаться -
 * лучше называть ее только next.
 *
 *Notice the call above to next(). Calling this function invokes the next middleware function in the app.
 * The next() function is not a part of the Node.js or Express API, but is the third argument that is passed to the
 * middleware function. The next() function could be named anything, but by convention it is always named “next”.
 * To avoid confusion, always use this convention.
 *
 * Пример:
 * var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}
 */

/**
 * app.use - функция которая будет использовать определенную другую функцию при каждом запросе(Но это не точно - возможно только для того
 * запроса перед которым app.use стоит или после запроса если app.use стоит после этого запроса). Например app.use upload -
 * при каждом get или post запросе будет вызываться функция upload. Но вероятно чтобы функция работала - она в параметрах
 * должна принимать req, res.
 * Обычно в app.use указывается middleware функция. То есть конкретно middleware(у которой есть запрос, ответ в параметрах (req, res))
 *
 * Для каждого приложения допускается наличие нескольких статических каталогов(можно использовать несколько раз в одном файле app.use
 * с разными функциями):

Пример:
 app.use(express.static('public'));
 app.use(express.static('uploads'));
 app.use(express.static('files'));

 Еще один пример - использование например роутинга
 // mount the router on the app
 app.use('/', router);
 */
app.use(upload());

/**
 * There we will connect this js file with the html file. SO when browser opens a page(makes a get request) - there will be returned our html file./
 * That how we works with js and html files.
 * The middleware is anything that contains request and responce
 */
app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/', (req, res) => {
    /**
     * if (req.files) - значит "если файлы есть" - то
     */
    if(req.files) {
        console.log(req.files);
        let users_file = req.files.file;
        let fileName = users_file.name;

        console.log("Загружаем файл " + fileName + " в базу данных");


        /**
         Ни один из нижеперечисленных вариантов не сработал:
         * connection.query("INSERT INTO media (file, file_name) VALUES (LOAD_FILE(?), ?)", users_file, fileName,function (error, result) {
         * connection.query("INSERT INTO media (file, file_name) VALUES (\"LOAD_FILE(users_file)\", ?)", fileName,function (error, result) {
         * connection.query("INSERT INTO media (file, file_name) VALUES (LOAD_FILE(?), 'fileName')", users_file,function (error, result) {

         И так, как я получил при попытке обработки файла ошибку - у меня такое впечатление
         что я в базу данных загрузил не файл, а "LOAD_FILE(users_file)", потому что ошибка при запуске workOnFile была:
         [Error: ENOENT: no such file or directory, open 'LOAD_FILE(users_file)'] {
         Причем не важно что я пытался обработать - image/xlsx файл - ошибка была с тем же значением. Или workOnFile работает неправильно
         или я неправильно написал запрос на то чтобы вставить файл в базу данных
         */

        connection.query("INSERT INTO media (file, file_name) VALUES (\'LOAD_FILE(users_file)\', ?)", fileName,function (error, result) {

        if (error) {
                console.log(error);
                throw error;
            } try {
                console.log("File was successfully inserted to database");
                res.redirect('/fileUploaded');
            } catch (error) {
                console.log("Error happened during request to DATABASE");
                throw error;
            }
        });


    }
})

/**

Так как я не придумал как брать данные из POST запроса и сразу вставлять в базу данных - я решил обойти
это костылем - скачивая файл который посылает юзер через file.mv
 После того как файл был скачан - функция convertExcelToCsv берет файл и превращает его в csv
 потом query запрос считывает данные из .csv файла и добавляет оттуда данные в базу данных.
 Это - временная идея - потому что я не написал корректный запрос для обработки данных напряму/ из загруженного excel файла
 */
app.post('/uploadExcel', (req, res) => {
    /**
     * if (req.files) - значит "если файлы есть" - то
     */
    if (req.files) {
        console.log(req.files);
        let file = req.files.file;
        let fileName = file.name;

        file.mv('./uploads/'+fileName, function (err) {
            if (err) {
                res.send(err);
            } else {
                console.log("Загружаем файл " + fileName + " в базу данных");
                let savedFile = path.join(__dirname+'/uploads'+ "/" + fileName);
                /**
                 * TODO: добавить распознавание расширения файла - если это excel или csv файл - то оно или будет включать convertExcelToCsv или не будет
                 */
               if (path.extname(savedFile) ==".xlsx") {
                    convertExcelToCsv(savedFile);
                }

                connection.query("LOAD DATA INFILE ? INTO TABLE excel CHARACTER SET latin1 FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES (id, region, brand, state, cost, sales);", savedFile, function (error, result) {
                    if (error) {
                        console.log(error);
                        throw error;
                    } try {
                        console.log("File was successfully inserted to database");
                        res.redirect('/fileUploaded');
                    } catch (error) {
                        console.log("Error happened during request to DATABASE");
                        throw error;
                    }
                });
            }
        });


            }

    /**
     Запросы отсюда сделаны для того чтобы вставлять данные напрямую из excel -  а не конвертировать при этом в csv как сейчас


     * https://stackoverflow.com/questions/60222660/how-to-read-text-file-from-post-with-express-uploadfile -
     * var logFile = req.files.fileName;

     console.log(logFile);
     var buffer = logFile.data;
     console.log(buffer.toString('utf8'));

     let users_file_data = req.files.file.data;
     let users_file_data = req.files.data;
     let users_file_data = req.files.filename;
     //connection.query('LOAD DATA INFILE \'?\' INTO TABLE excel (region, brand, state, cost, sales);', users_file,function (error, result) {
                //connection.query('LOAD DATA [LOCAL] INFILE \'?\' INTO TABLE excel;', users_file,function (error, result) {
                //connection.query("LOAD DATA INFILE \'?\' INTO TABLE excel (date, region, brand, state, cost, sales);", users_file_data,function (error, result) {
                //connection.query("LOAD DATA INFILE '/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/test.csv' INTO TABLE excel FIELDS TERMINATED BY ';' (region, brand, state, cost, sales);", function (error, result) {
                // connection.query("LOAD DATA INFILE ? INTO TABLE excel CHARACTER SET utf8mb4 (region, brand, state, cost, sales);", users_file_data,function (error, result) {
                //connection.query("LOAD DATA INFILE ? INTO TABLE excel FIELDS TERMINATED BY '\t' ENCLOSED BY '\"' LINES TERMINATED BY '\n' (region, brand, state, cost, sales);", users_file_data, function (error, result) {
     */
        })

/**
 Этот запрос будет обрабатывать только csv файлы - так сделано потому что синтаксис для разных файлов - всегда разный
 */
app.post('/uploadCSV', (req, res) => {
    /**
     * if (req.files) - значит "если файлы есть" - то
     */
    if (req.files) {
        console.log(req.files);
        let file = req.files.file;
        let fileName = file.name;

        console.log("Загружаем файл " + fileName + " в базу данных");
        file.mv('./uploads/'+fileName, function (err) {
            if (err) {
                res.send(err);
            } else {
                console.log("Загружаем файл " + fileName + " в базу данных");
                let dataToQuery = path.join(__dirname+'/uploads'+ "/" + fileName);
                connection.query("LOAD DATA INFILE ? INTO TABLE excel CHARACTER SET latin1 FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES (id, region, brand, state, cost, sales);", dataToQuery, function (error, result) {
                    if (error) {
                        console.log(error);
                        throw error;
                    } try {
                        console.log("File was successfully inserted to database");
                        res.redirect('/fileUploaded');
                    } catch (error) {
                        console.log("Error happened during request to DATABASE");
                        throw error;
                    }
                });
            }
        });
    }
})

app.get('/fileUploaded', (req, res) =>{
    res.sendFile(__dirname + '/views/fileUploaded.html');
})

/**
 * В этой функции мы берем наш файл и обрабатываем его.
 * Файл пока только один и он захардкожен. Чтобы обработать другой файл - последние столбцы в нем
 * должны называться так же как называются здесь (check workOnFile please)
 */


app.post('/fileUploaded', (req, res) => {
    //let pathToFile = path.join(__dirname+'/uploads'+'/excelAutomation.xlsx');

    // console.log("I am in POST request 'fileUploaded'");

    /**
     * Связь между кнопкой отправки лежит в методе "app.post" и в html
     * лежит <form method="POST" action="/fileUploaded" enctype="multipart/form-data"> - form method
     * и action - fileUploaded
     */

/**

  по этому запросу стало понятно что все же проблема в запросах которых я писал и теперь нужно что-то с этим делать
    connection.query('SELECT LAST_INSERT_ID() FROM media', (error, results) => {
        if (error) return res.json({error: error});


        res.json({

            id: results[0]['LAST_INSERT_ID()'],
            file_name: results[0]
        });
    });

})*/




    //connection.query("SELECT file FROM media WHERE LAST_INSERT_ID()", function (error, result) {
    //  connection.query("SELECT LAST_INSERT_ID() FROM media", function (error, result) {
      //connection.query("SELECT file_name FROM media WHERE id = 16", function (error, result) {
          //connection.query("SELECT LOAD_FILE(file) FROM media WHERE id = 16", function (error, result) {
    //connection.query("SELECT LAST_INSERT_ID() FROM media", function (error, result) {
    connection.query("SELECT file FROM media WHERE id = 19", function (error, result) {


              //connection.query("SELECT \"LOAD_FILE(file)\" FROM media WHERE id = 16", function (error, result) {
              if (error) {
                  console.log(error);
                  throw error;
              }

              console.log("I am in POST request '/fileUploaded' in connection query method");
              console.log(result[0]);
              console.log(result);
        console.log(result[0].file);
              let pathToFile = result[0].file;
              //let pathToFile = result[0]['file'];
              //let pathToFile = result[0];
              workOnFile(pathToFile, res);


                  /**
                   Это про то - если выводить картинку на экране например
                   response.writeHead(200, {
            'Content-Type': 'image/jpeg'
        });
                   response.send(result);
                   */

              })

    /**
     * Здесь после workFile нужно будет написать запрос который вставляет новый файл в колонку для новых файлов
     */
})

        /* if (error) {
             console.log(error);
             throw error;
         }



        try {
            console.log("I am in POST request '/fileUploaded' in connection query method");
            //console.log("File was successfully downloaded from database");
            //

            res.sendFile(__dirname + '/views/fileWorked.html');
            // return pathToFile;
        } catch (error) {
            console.log("Error happened during request to DATABASE");
            throw error;
        }
    }
}
})*/

app.get('/downloadNewFile', (req, res) => {


   // res.sendFile(__dirname + '/views/fileWorked.html');
    // res.sendFile(__dirname + '/views/fileUploaded.html');
    // if(req) {
    console.log("I am in GET request '/downloadNewFile'");
    //connection.query("SELECT file FROM media WHERE LAST_INSERT_ID()", function (error, result) {
    //  connection.query("SELECT LAST_INSERT_ID() FROM media", function (error, result) {
    //  connection.query("SELECT file_name FROM media WHERE id is 16", function (error, result) {
    //connection.query("SELECT LOAD_FILE(file) FROM media WHERE id = 16", function (error, result) {
    //  connection.query("SELECT * FROM media WHERE id = 16", function (error, result) {


    connection.query("SELECT file FROM media WHERE id = 19", function (error, result) {


        //connection.query("SELECT \"LOAD_FILE(file)\" FROM media WHERE id = 16", function (error, result) {
        if (error) {
            console.log(error);
            throw error;
        }
        try {
            console.log("File was successfully downloaded from database");
            //  res.redirect('/');
            console.log("I am in POST request '/fileUploaded' in connection query method");
            console.log(result[0]);
            console.log(result);
            console.log(result[0].file);
            let pathToFile = result[0].file;
             //sendFile(pathToFile, res);
            // return pathToFile;
            sendFileSafe(pathToFile, res);
        } catch (error) {
            console.log("Error happened during request to DATABASE");
            throw error;
        }
    })
})




    /*let pathToFile = path.join(__dirname+'/downloads'+'/newDataFile.xlsx');
    sendFile(pathToFile, res);*/


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')

})

/**
 * About passport.authenticate http://www.passportjs.org/docs/authenticate/
 */
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

/**
После регистрации поля из запроса - username, hashed "password" и email пользователя попадают в базу данных. Они попадают в
 виде JSON объекта и вставляются как set.
 var credentials = {key: value}, где key - это имя столбца в MySql, а value - значение для записи(в нашем случае взятое
 из запроса который пользователь отправляет когда вводит данные в поле и жмет submit - делая post request)


 */
app.post('/register', checkNotAuthenticated, async (req, res) => {
       const hashedPassword = await bcrypt.hash(req.body.password, 10);
       var credentials ={
           username: req.body.name,
           email: req.body.email,
           password_hash: hashedPassword
       }

        connection.query('INSERT INTO credentials SET ?',credentials, function (error, results, fields) {
            if (error) {
                console.log("error ocurred ",error);
                res.redirect('/register')
            } else {
                console.log('Results of entered data: ', results);
                res.redirect('/login');
            }
        });

    /**
     *This method shows us in console that password will already be hashed. And user name with user email will not be hashed.
     */
   console.log(credentials);
})

/**
 * Delete функция выполняет logout
 TODO: Если бы пользователь удалялся то для этого можно было-бы использовать удаление из базы данных
 connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (error,results) =>{
        if (error) return res.json({error: error});

        res.json({});
    });
 */
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

/**
 * This "every request (*)" realization is only for download files from uploads folder.
 * More of code documentation and explanation comments of this method is in fileDownload2.js file!

 *So this function allow to simply download files whatever you want in this project

 * TODO: File который отправляется мы должны взять из базы данных MySql

 */
app.get('*', (req, res) => {
    /**
     * Code with checkAccess will be temporary disabled until I will find the way use it with login and with my whole project
     * so it's not needed for now to send secret in url
     */
    /*
    if(!checkAccess(req)) {
        res.statusCode = 403;
        res.end("Tell me the secret to access!");
        return;
    }*/
    sendFileSafe(url.parse(req.url).pathname, res);
});

/**
 * TODO: File который отправляем мы должны взять из базы данных MySql
 */
app.get('/downloadFiles', (req, res) => {
    res.sendFile(__dirname + 'views/downloadFiles.html');

        if(res.files){
            console.log(res.files);
            //let file = path.join(__dirname+'/uploads'+'/excelAutomations.js');
            let file = req.files.file;
            let filename = file.name;
            console.log(filename);

            file.mv('./uploads/'+filename, function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(file);
                }
            });
        }
    });

app.listen(3000);

function checkAccess(req){
    return url.parse(req.url, true).query.secret == 'o_O';
}


function sendFileSafe(filePath, res){
    try{
        filePath = decodeURIComponent(filePath);
    }catch(e){
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }

    if(~filePath.indexOf('\0')){
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }
    filePath = path.normalize(path.join(ROOT, filePath));

    if(filePath.indexOf(ROOT) != 0){
        res.statusCode = 404;
        res.end("File not found");
        return;
    }

    fs.stat(filePath, function(err, stats){
        if(err || !stats.isFile()){
            res.statusCode = 404;
            res.end("File not found");
            return;
        }
        sendFile(filePath, res);
    });
}

function sendFile(filePath, res){
    fs.readFile(filePath, function(err, content){
        if (err) throw err;
        /**
         * The ultimate javascript content-type utility. lookup - переводится как "просмотр".
         * То есть можно просмотреть контент который мы указываем.
         */
        var mime = require('mime').lookup(filePath);
        res.setHeader('Content-Type', mime + "; charset=utf-8");
        res.end(content);
    });
}

function workOnFile(pathToFile, res){
    /**
     * В этой функции нам нужно указать на excelAutomation.js в который передать вот этот вот файл.
     */

    console.log("Work started on your file in workOnFile function");
    fs.readFile(pathToFile, function(err, content){
        if (err) {
            throw err;
        } else {
            /**
             * возможно следует сделать редирект на fileDownloaded и на том GET запросе выдавать этот файл
             */
            res.sendFile(__dirname + '/views/fileWorked.html');




            let wb = xlsx.readFile(pathToFile, {cellDates:true});
            let ws = wb.Sheets["Main Sheet"];
            var data = xlsx.utils.sheet_to_json(ws);
            var newData = data.map(function(record){
                var net = record.Sales - record.Cost;
                record.Net = net;
                delete record.Sales;
                delete record.Cost;
                return record;
            });


            var newWB = xlsx.utils.book_new();

            var newWS = xlsx.utils.json_to_sheet(newData);
            xlsx.utils.book_append_sheet(newWB,newWS,"New Data");

            xlsx.writeFile(newWB, "./downloads/newDataFile.xlsx");

            console.log(wb.SheetNames);


            /**
             * Здесь нужен query insert file в базу данных когда новый файл создан
             */
            }
    });
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

/**
 *Этот callback поставлен здесь, чтобы если юзер не аутентифицирован - тогда ему открывается login.
 * А если он уже был аутентифицирован - тогда /login будет ему не доступен
 * Я думаю что req.isAuthenticated каким-то образом связан с done функцией которая возвращает пользователя, если такой есть
 */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

/**

 * https://stackoverflow.com/questions/42373879/node-js-get-result-from-mysql-query - найдено здесь


 * dbQuery - it's not something specific - it's jut my way to implement this function with the promise (it's the only way to implement this
 * type of requests via promise
 * but db.query - is something more specific
 * Found there - https://stackoverflow.com/questions/42373879/node-js-get-result-from-mysql-query
 */

async function connectionQueryId(databaseQuery, email) {
    return new Promise(data => {
        connection.query(databaseQuery, email, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                let userId = result[0].id;
                return userId;
            } catch (error) {
                console.log("Error happened during request to DATABASE");
                data({});
                throw error;
            }
        });
    });
}

async function connectionQueryEmail(databaseQuery, email) {
    return new Promise(data => {
        connection.query(databaseQuery, email,function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                let userEmail = result[0].email;
                let userPassword = result[0].pasword;
                return [userEmail,userPassword];
            } catch (error) {
                console.log("Error happened during request to DATABASE");
                data({});
                throw error;
            }
        });
    });
}

/**
 * This is a function to convert data from excel to csv and write this file into our file system
 */
  async function convertExcelToCsv(savedFile){

            let wb = xlsx.readFile(savedFile, {cellDates: true});
            //let wb = xlsx.readFile('/Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/uploads/excelAutomation.xlsx', {cellDates: true});
            let ws = wb.Sheets["Main Sheet"];
            let dataTest = xlsx.utils.sheet_to_csv(ws);

    /**
     * This is a function which just change fileName (means dataToConvert) - it trims extension and add another csv extension
     */

     let nameBeforeConcatination = savedFile.split('.');//it should return file name without extension
     let convertedFileName = nameBeforeConcatination[0].concat(".csv");
     console.log("I am converted file name" + convertedFileName);


   // fs.writeFile("./uploads/" + "dataConvertedExcel.csv", dataTest, (err) => {
            fs.writeFile(convertedFileName, dataTest, (err) => {
            if (err) throw err;
                console.log('The file has been saved!');
            });
            console.log("convertExcelToCsv has been done successfully")
}

/**
 * Эта функция МОГЛА БЫ БЫТЬ универсальна для любых запросов в базу данных, включая
 * getUserEmail , getUserPassword ЕСЛИ БЫ НЕ result[0].password - в ней указано что именно вернуть
 * так что придется иметь две разные функции. К сожалению передавать эти данные через параметры функции я пока не научился в node js

 Этот запрос мы возможно будем использовать для получения данных по excel из базы данных

 Использовать с этим запросом

 databaseUserData = connectionQueryData('SELECT id, email, username, reg_date, password FROM credentials WHERE id = 7')


async function connectionQueryData(databaseQuery) {
    return new Promise(data => {
        connection.query(databaseQuery, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                let userId = result[0].id;
                let userEmail = result[0].email;

                //return userId, userEmail;
                //let userName = result[0].username;
               // const data = [result[0].id, result[0].email];
                //return data;
               // return Promise.resolve([result[0].id, result[0].email])

                //return [userId, userEmail];
                return {userId: userId, userEmail: userEmail};
            } catch (error) {
                console.log("Error happened during request to DATABASE");
                data({});
                throw error;
            }
        });
    });
}
 */