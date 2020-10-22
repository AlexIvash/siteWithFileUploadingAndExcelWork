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
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

/**
 * After start the server - you can download the file with using this url:
 * http://localhost:3000/newDataFile.xlsx?secret=o_O
 */

/**
 * Every of these express libraries should be installed. I mean "npm I express -D; npm I express-fileupload -D"
 * @type {*|Express}
 */
const app = express();


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

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
 *
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

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users);/*I have placed it there to just have fun seeing in realtime
   what have come to the array*/
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

/**
 * There we will connect this js file with the html file. SO when browser opens a page(makes a get request) - there will be returned our html file./
 * That how we works with js and html files.
 * The middleware is anything that contains request and responce
 */
app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


/**
 * This "every request (*)" realization is only for download files from uploads folder.
 * More of code documentation and explanation comments of this method is in fileDownload2.js file!
 */
app.get('*', (req, res) => {
    if(!checkAccess(req)) {
        res.statusCode = 403;
        res.end("Tell me the secret to access!");
        return;
    }
    sendFileSafe(url.parse(req.url).pathname, res);
});

app.get('/downloadFiles', (req, res) => {
    res.sendFile(__dirname + '/downloadFiles.html');

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

app.post('/', (req, res) => {
    if(req.files){
        console.log(req.files);
        let file = req.files.file;
        let filename = file.name;
        console.log(filename);

        file.mv('./uploads/'+filename, function (err) {
            if (err) {
        res.send(err);
            } else {
                res.send("File Uploaded");
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

        var mime = require('mime').lookup(filePath);
        res.setHeader('Content-Type', mime + "; charset=utf-8");
        res.end(content);
    });
}
