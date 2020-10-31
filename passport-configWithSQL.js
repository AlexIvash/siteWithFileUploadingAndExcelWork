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
//function initialize(passport, userEmail, userPassword) {
function initialize(passport) {
  //authenticateUser это наша функция и может быть реализована как угодно - это хорошо показано вот здесь: http://www.passportjs.org/docs/username-password/


  /**
   * dbQuery - it's not something specific - it's jut my way to implement this function with the promise (it's the only way to implement this
   * type of requests via promise
   * but db.query - is something more specific
   */

  async function getUserPassword() {
    return result = await dbQuery('SELECT password FROM credentials WHERE id = 7');
  }


   function dbQuery(databaseQuery) {
    return new Promise(data => {
      connection.query(databaseQuery, function (error, result) { // change db->connection for your code
        if (error) {
          console.log(error);
          throw error;
        }
        try {
          console.log(result);
          return data(result);
          console.log("I am data" + data);
          console.log("Data from database" + data[0].split(' '));
        } catch (error) {
          data({});
          throw error;
        }
      });
    });
  }


  const authenticateUser = async (email, password, done) => {
    /**
     * console.log размещенный здесь говорит нам о том что пароль который прилетает к нам из поля прилетает корректным.
     * Тогда если выдает ошибку что password incorrect - вероятно проблемы со сравниваем паролей? Хотя в login.js это работало неплохо
     */
    console.log(password);
   // console.log(userPassword);//прилетает function...как бы сделать так чтобы вместо функции летел результат
    //не смотря на то что бля - эта функция содержит return с валидным результатом в виде пароля - я все равно хз как сделать так чтобы
    //сюда прилетало значение а не сама функция
    //const user = userEmail;
    // В этом причина почему password incorrect. Потому что раньше оно искало по массиву где искало какой-либо эмэил -
    // а теперь оно не может найти потому что тут не массив данных со всеми данными пользователя,
    // а только userEmail
    //нам нужно вхерачить сюда еще пароль который пользователь вводит
    //как бы здесь теперь указать на passwordField
    /**Так как это не работает сейчас - я это временно закоментирую - здесь нужно будет указать что если userEmail doesn't exist in credentials table
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }*/



    try {

      //основная проблема в том что сюда почему-то не попадает пароль. Или он попадает ноо просто очено много одинаковых записей в базе?
      //нет причина именно в том что что-то идет не так
       if (await bcrypt.compare(password, getUserPassword)) {

         return done(null, user)
         console.log("Compare was successfull");
        // console.log("I compare here password from POST request " + password +" and password from dataBase " + userPassword);
      } else {
         //Это не правильный вариант потому что сюда прилетает не то что хранится в базе данных - а сам запрос "SELECT email FROM credentials WHERE id = 7"
         //Я проверил и подобное на обычном запросе работает очень хорошо.
         //это нужно как-то обойти
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }
  /**
   * Мы не можем { usernameField: 'email' } убрать потому что это поле - это как раз то поле которое мы считываем с поля ввода при логине и регистрации
   * authenticateUser - это функция которая в этом мануале ( http://www.passportjs.org/docs/username-password/ ) заменяет обычную переданную в аргументах функцию
   * "function(username, password, done)"
   */
  //passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true}, authenticateUser))
  passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, authenticateUser))
  //а в authenticate user мы можем передать аргументы даже - https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84

  passport.serializeUser((userEmail, userPassword, done) => done(null, userEmail))
  //passport.serializeUser((user, done) => done(null, user.id))

  passport.deserializeUser((userEmail,userPassword, done) => {
    return done(null, userEmail,userPassword)
  })
}
/*
passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}*/

module.exports = initialize