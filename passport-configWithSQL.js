/**
 * This file I took from my project node-js-passport-login.
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
// by default, local strategy uses username and password, we will override with email and password
//userEmail, userPassword - данные которые мы берем из нашей базы данных
function initialize(passport, databaseUserEmail, databaseUserPassword) {
//function initialize(passport) {
  //authenticateUser это наша функция и может быть реализована как угодно - это хорошо показано вот здесь: http://www.passportjs.org/docs/username-password/


  /**
   * dbQuery - it's not something specific - it's jut my way to implement this function with the promise (it's the only way to implement this
   * type of requests via promise
   * but db.query - is something more specific
   * Found there - https://stackoverflow.com/questions/42373879/node-js-get-result-from-mysql-query
   */

  /*async function getUserPassword() {
    return result = await dbQuery('SELECT password FROM credentials WHERE id = 7');
  }


  async function dbQuery(databaseQuery) {
    return new Promise(data => {
      connection.query(databaseQuery, function (error, result) { // change db->connection for your code
        if (error) {
          console.log(error);
          throw error;
        }
        try {
          var data = result[0].password;
          console.log(result[0].password);
          return data;
        } catch (error) {
          data({});
          throw error;
          console.log("Error happened during request to DATABASE")
        }
      });
    });
  }*/


  const authenticateUser = async (email, password, done) => {
    /**
     * console.log размещенный здесь говорит нам о том что пароль который прилетает к нам из поля прилетает корректным.
     * Тогда если выдает ошибку что password incorrect - вероятно проблемы со сравниваем паролей? Хотя в login.js это работало неплохо
     */
    console.log("I am password entered in field " + password);
   // console.log(userPassword);//прилетает или function или promise...как бы сделать так чтобы вместо функции летел результат
    //не смотря на то что бля - эта функция содержит return с валидным результатом в виде пароля - я все равно хз как сделать так чтобы
    //сюда прилетало значение а не сама функция
    const user = databaseUserEmail;
    // В этом причина почему password incorrect. Потому что раньше оно искало по массиву где искало какой-либо эмэил -
    // а теперь оно не может найти потому что тут не массив данных со всеми данными пользователя,
    // а только userEmail
    //нам нужно вхерачить сюда еще пароль который пользователь вводит
    //как бы здесь теперь указать на passwordField

    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }
    //var pass = getUserPassword();
    /*var pass = getUserPassword;
    console.log("I am password " + pass);*/


    try {
     /* console.log("I am password from database" + userPassword);
      var pass2 = getUserPassword();
      console.log("I am pass2" + pass2)*/
       //if (await bcrypt.compare(password, getUserPassword)) {
      //let userPassword = databaseUserPassword.toString();
      let userPassword = databaseUserPassword;
     // let userPassword2 = 'SELECT password FROM credentials WHERE id = 7';
      console.log("I am user password from fileUploading " + userPassword);
      //в bcrypt третьим коллбэком можно кстати разместить callback-функцию https://www.npmjs.com/package/bcrypt
         if (await bcrypt.compare(password, userPassword))
       {
           console.log("I am user password from fileUploading which is from database " + databaseUserPassword);
        // console.log("I am password from database" + getUserPassword);
         console.log("Compare password from POST request and database was successfull");
         return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }


    //if (await bcrypt.compare(password, userPassword2, connection.query('SELECT password FROM credentials WHERE id = 7', function (err, rows, fields) {
    /* if (await bcrypt.compare(password, connection.query('SELECT password FROM credentials WHERE id = 7', function (err, rows, fields) {
           // Call reject on error states,
           // call resolve with results
           if (err) {
             return reject(err);
           }
           return (rows[0].password);
           console.log("There is data base data in bcrypt "+ rows[0].password);
         })
     ))*/


  /**
   * Мы не можем { usernameField: 'email' } убрать потому что это поле - это как раз то поле которое мы считываем с поля ввода при логине и регистрации
   * authenticateUser - это функция которая в этом мануале ( http://www.passportjs.org/docs/username-password/ ) заменяет обычную переданную в аргументах функцию
   * "function(username, password, done)"
   */
  //passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true}, authenticateUser))
  passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, authenticateUser))
  //а в authenticate user мы можем передать аргументы даже - https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84

  passport.serializeUser((databaseUserEmail, databaseUserPassword, done) => done(null, databaseUserEmail))
  //passport.serializeUser((user, done) => done(null, user.id))

  passport.deserializeUser((databaseUserEmail,databaseUserPassword, done) => {
    return done(null, databaseUserEmail,databaseUserPassword)
  })
}
/*
passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}*/

module.exports = initialize