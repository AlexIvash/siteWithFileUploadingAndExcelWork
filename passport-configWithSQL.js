/**
 * This file I took from my project node-js-passport-login and I've modificated it there.
 * It will be used here with fileUploadingVersionThreeLoginWithSQL.js
 */

const mysql = require('mysql2');

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

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
/** by default, local strategy use username and password, we will override with email and password
 databaseUserId - email который прилетается к нам из нашей базы данных (запрос в бд написан в promise)*/
function initialize(passport, databaseUserId, databaseUserEmail) {

  /**
   authenticateUser - это функция, которая может быть реализована как угодно -
   это хорошо показано вот здесь: http://www.passportjs.org/docs/username-password/


   console.log размещенный внутри нее говорит нам о том что пароль который прилетает к нам из поля прилетает корректным.
   */

  const authenticateUser = async (email, password, done) => {
    console.log("I am password entered in field: " + password);

    /**
     * Это - неправильная реализация функции проверки
     * TODO: нужно сделать запрос таким который ищет именно по этому email в базе данных и если нету такого юзера в базе данных
     * TODO: то возвращает ошибку
     * TODO: const user = getUserByEmail(email); нужно реализовать с запросом в базу данных
     */

    const user = databaseUserEmail(email);
    const userId = databaseUserId(email);

    /**
     * Это console.log вернется [object Promise] но не смотря на то что здесь возвращает console.log - это мегаохрененно работает
     */
    console.log("I am function of searching user in database by entered email and this is found user: "+user);
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    /**
     * В этой функции я пытался воплотить получение данных через запрос в sql в promise на странице fileUploading
     * но это не сработало. Так что пришлось сделать так. Это говорит о том что promise не всегда будут работать - иногда
     * придется искать обходные пути для функций которые не принимают каких-либо параметров
     */
    try {
      connection.query("SELECT password_hash FROM credentials WHERE email = ?", email, function (err, rows, fields) {
        if (err) {
          console.log(err);
          throw err;
        } else if(!rows.length){
          return done(null, false, { message: 'No user with that email' })
        } else if (bcrypt.compare(password, rows[0].password_hash)) {
          console.log("Compare password from POST request and database was successfull. I am user password from fileUploading which is from database " + rows[0].password_hash);
          return done(null, user)
        } else {
          return done(null, false, { message: 'Password incorrect' })
        }
      })} catch (e) {
      return done(e)
    }
  }


  /**
   * { usernameField: 'email' } - данные который мы считываем из поля "login" при логине в файле login.ejs
   * authenticateUser - это функция которая в этом мануале ( http://www.passportjs.org/docs/username-password/ ) - заменяет обычную переданную в аргументах функцию
   * "function(username, password, done)"
   *
   * Так же мы в authenticate User можем передать аргументы https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84
   * TODO: В данный момент они скорее всего тоже работают неправильно. Необходимо будет добавить корректный запрос id в котором
   * TODO: система логинит или вылогинивает юзера не только по email, а по айди
   */
  passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser));

  passport.serializeUser((userId, done) => done(null, userId));

  passport.deserializeUser((id, done) => {
  //passport.deserializeUser((databaseUserId(id), done) => {
    return done(null, databaseUserId(id))
  //passport.deserializeUser((userId, done) => {
    //return done(null, userId)
  });
}

module.exports = initialize