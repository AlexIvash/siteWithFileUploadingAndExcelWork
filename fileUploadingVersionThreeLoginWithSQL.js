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
ВОТ ЗДЕСЬ ДЛЯ ЛОГИНА МЫ ДАЕМ ДАННЫЕ EMAIL, PASSWORD
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
         */


const initializePassport = require('./passport-configWithSQL')
initializePassport(
    passport,
    databaseUserEmail = connectionQueryEmail('SELECT email FROM credentials WHERE id = 7'),
    databaseUserPassword = connectionQueryPassword('SELECT password FROM credentials WHERE id = 7'))
     //можно конечно добавить запись из бд в массив и считать оттуда как это было раньше - но это ведь 1) Неправильно 2) тоже самое что и присвоить значение
     //обычной переменной?
     /*.then(function(){
             //this function will be called if previous function "connectionQueryPassword" successfully done
     //console.log("Then function was successfully launched")*/

    //databaseUserPassword = getUserPassword())
    //databaseUserPassword = Promise.resolve(getUserPassword()))
   /* userPassword => async function getUserPassword() {
        return result = await dbQuery('SELECT password FROM credentials WHERE id = 7');
    })*/





/*Так это было ДО
userEmail = email => connection.query('SELECT email FROM credentials WHERE id = 7', (error, results) => {
        if (error) {
            console.log(error);
        } else {
            var userEmail = results[0];
            console.log(userEmail);
            return userEmail;
        //console.log("I am request results " + results);
            //эта хрень даже не исполняется. Значит ошибка в том что эта функция даже не выполняется при запросе правильно -
            // ошибка не в возврате ответа от базы данных а в том что мы неправильно решили записать этот запрос. Это все правильно было-бы
            //обернуть в дополнительную функцию
    }
    }),
    function databaseUserPassword(){
           connection.query('SELECT password FROM credentials WHERE id = 7', (error, result) => {
               let data = result[0].password;
               console.log(data);
               return data;
       }
           )}


           НО - обычные callback функции возвращали не пароль а сами себя и это было невозможно обойти как-то кроме промисов. Потому решено
           было использовать промисы
*/






//const users = [];
var pathToFile;

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
    if(req.files){
        console.log(req.files);
        let file = req.files.file;
        let fileName = file.name;
        /**
         * С помощью const/var (я еще не понял как это сделать)
         *нам нужно будет установить это как глобальную переменную которая будет указывать на
         * файл который мы загрузили. Переменная будет выглядеть как-то так:
         let pathToFile = file.path;
         * Переменная будет нужна нам чтобы выбрать этот путь к файлу и отдать его в запросе fileUploaded

         */

        console.log(fileName);

        file.mv('./uploads/'+fileName, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/fileUploaded');
                /**
                 * TODO: После того как File перемещен командой mv - мы должны сразу взять и загрузить его в базу данных MySql
                 connection.query('INSERT INTO tasks (description) VALUES (?)', [req.body.item], (error, results)=>{
    if (error) return res.json({error: error});

    connection.query ('SELECT LAST_INSERT_ID() FROM tasks', (error, results) => {
        if (error) return res.json({error: error});



        res.json({

                id: results[0]['LAST_INSERT_ID()'],
                description: req.body.item
            });
    });
});
                 А если такой файл уже есть - тогда мы должны не добавлять его, а апдейтить
                 connection.query('UPDATE tasks SET completed = ? WHERE id = ?', [req.body.completed, req.params.id], (error, results) =>{
        if (error) return res.json({error: error});

        res.json({});
    });
                 */
            }
        });
    }
});

app.get('/fileUploaded', (req, res) =>{
    res.sendFile(__dirname + '/views/fileUploaded.html');
})

/**
 * В этой функции мы берем наш файл и обрабатываем его.
 * Файл пока только один и он захардкожен. Чтобы обработать другой файл - последние столбцы в нем
 * должны называться так же как называются здесь (check workOnFile please)
 */
app.post('/fileUploaded', (req, res) =>{
    let pathToFile = path.join(__dirname+'/uploads'+'/excelAutomation.xlsx');

    console.log("I am in POST request 'fileUploaded'");

    /**
     * Связь между кнопкой отправки лежит в методе "app.post" и в html
     * лежит <form method="POST" action="/fileUploaded" enctype="multipart/form-data"> - form method
     * и action - fileUploaded
     */
    workOnFile(pathToFile, res);
})

app.get('/downloadNewFile', (req, res) =>{
    /**
     * TODO: Когда мы отправляем File пользователю - мы должны взять его не из папки проекта, а из базы данных MySql
     * connection.query('SELECT * FROM tasks ORDER BY created DESC', (error, results) => {

        if (error) return res.json({error: error});
        res.json(results);
    });
     */
    let pathToFile = path.join(__dirname+'/downloads'+'/newDataFile.xlsx');

    console.log("I am in GET request '/downloadNewFile'");

    sendFile(pathToFile, res);
})

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
После регистрации поля из запроса - username, hashed "password" и email пользователя попадают в базу данных
 */
app.post('/register', checkNotAuthenticated, async (req, res) => {
       const hashedPassword = await bcrypt.hash(req.body.password, 10);
       var credentials ={
           username: req.body.name,
           email: req.body.email,
           password: hashedPassword
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
    fs.readFile(pathToFile, function(err, content){
        if (err) {
            throw err;
        } else {
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
 *Эта функция МОГЛА БЫ БЫТЬ универсальна для любых запросов в базу данных, включая
 * getUserEmail , getUserPassword ЕСЛИ БЫ НЕ result[0].password - в ней указано что именно вернуть
 * так что придется иметь две разные функции. К сожалению передавать эти данные через параметры функции я пока не научился в node js
 *
 * https://stackoverflow.com/questions/42373879/node-js-get-result-from-mysql-query - найдено здесь
 */


async function connectionQueryPassword(databaseQuery) {
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.

        /*
        Это возможно будет доступно для использования с запросами по конкретному email - но я не буду
        это реализовывать сейчас
        var query_str =
            "SELECT name, " +
            "FROM records " +
            "WHERE (name = ?) " +
            "LIMIT 1 ";

        var query_var = [password];
        connection.query(query_str, query_var, function (err, rows, fields) {
*/
        connection.query(databaseQuery, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows[0].password);
            console.log("There is data base data "+ rows[0].password);
        });
    });
}
/*Я думал что это плохой запрос - НО НЕТ!! НА САМОМ ДЕЛЕ ОН ТОЖЕ ХОРОШ КАК И ПРЕДЫДУЩИЙ.
Но оба одинаково плохо работают с bcrypt.compare - так что может дело все же в самой функции bcrypt?
Эти два запроса можно было бы совместить в один если бы тут еще выполнялся запрос с данными про конкретный email
пользователя



async function connectionQueryPassword(databaseQuery) {
     return new Promise(data => {
        connection.query(databaseQuery, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                data(result[0].password);
                let pass = result[0].password;
                resolve(pass);
               /* let data = result[0].password;
               console.log(data);
                return data;Я думаю что это лишнее потому что data - executor
                и видимо он запишет данные в результат*/
/*
            } catch (error) {
                data({});
                throw error;
                console.log("Error happened during request to DATABASE")
            }
        });
    }).then(
        function(){
         /*this function will be called if previous function "connectionQueryPassword" successfully done
            Эта функция будет выполняться только если вначале стоит " let promise = Promise.resolve(data => {"

            НО - если стоит вначале "return new Promise(data => {" - тогда первой срабатывает функция которая выведет
          console.log хэшированный пароль из базы данных - ХОТЯЯ ошибка - если сюда добавить catch то это не играет роли*/
/*
         console.log("Then function was successfully launched")}).catch((err) => setImmediate(() => { throw err; }));
}*/

async function connectionQueryEmail(databaseQuery) {
    return new Promise(data => {
        connection.query(databaseQuery, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                let data = result[0].email;
                console.log(data);
                return data;
            } catch (error) {
                data({});
                throw error;
                console.log("Error happened during request to DATABASE")
            }
        });
    });
}


/** нерабочий вариант
 * async function connectionQueryPassword(databaseQuery) {
    //return new Promise(data => {
    let promise = Promise.resolve(
        connection.query(databaseQuery, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                let data = result[0].password;
                console.log(data);
                return data;
            } catch (error) {
                data({});
                throw error;
                console.log("Error happened during request to DATABASE")
            }
        })
    )
    return promise;
}
 */