/**
 * This file I took from my project node-js-passport-login.
 * It will be used here with fileUploadingVersionThreeLogin.js and fileUploadingVersionThreeLoginWithSQL.js
 */


const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    /**
     * if user hasn't been found in the users array(array imitate DataBase) by his email - this user doesn't exist in the "DataBase".
     * Done - is a function that we call when we will authenticate user (successfully for user or not. In this
     * function done will return or user email or done with error message

     * The first argument for done function is error which we can recieve there.
     * As far as now we don't have an error - we will
     * pass "null" there. The second parameter - is in our case "user we found there (taken from users massive
     * which was given to this method in arguments(method has been called from passport-config)", third parameter
     * is message which will be exposed on the page if we didn't find that user(message with which this function
     * will be ended and message which will be returned.).
     */
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      /**
       * If hashed password on the array and password from request matched -
       * there will be successfull function "done". To this function we will return variable user which contains
       * user email which we want to authenticate.
       * http://www.passportjs.org/docs/configure/ - there is a really good, claryfying example here.
       * Also done is asynchronous function, when "return" is also asynchronous - or not? Then it would be a really good difference
       * between done and "return" keyword.

       * If password's didn't match -
       * will be used block "else" where no user will be returned. Instead will be
       * returned message 'Password incorrect' which user will see in the browser on "/login" link.

       * bcrypt.compare can compate even simple not hashed data with hashed data.
       */
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
      /**
       * Функция вернет done который будет содержать имя юзера. Это имя будет передано
       * из этой callback функции authenticateUser в функцию passport.use ниже
       * passport.use сравнивает email который прилетел из запроса и email который вернется authenticateUser
       * функция. AuthenticateUser функция возвращает email ТОЛЬКО в случае если пароль из хэша(в бд) и пароль
       * присланный в запросе сопадают. Если она не вернет user.email - тогда функция passport.use будет провалена.
       */
    }
  }

  /**
   * Вторым аргументом передана функция аутентификации. Это функция passport.local strategy.
   * Первым параметром берет usernameField(кстати вторым значением в json объекте можно было-бы
   * передать и пароль - но он уже передан в другой функции) и с usernameField вторым параметром
   * вызывает callback authenticateUser - функцию(через callback).
   *  authenticateUser после прохождения в ней аутентификация в случае успеха возвращает user email и passport.use
   *  сравнивает его через local strategy с user email из бд и соответственно делает
   *  return done (который "true") или - если в функции authenticateUser аутентификация не была успешной -
   *  она вернет сообщение об ошибки - тогда после сравнения сообщения с user email из бд -
   *  здесь аутентификация не пройдет и таким образом юзер НЕ БУДЕТ
   *  аутентифицирован.

   *  В passport.use localstrategy можно так же передавать и логин и пароль в JSON
   *  формате и они сравниваются с логином и паролем из бд(но так как у нас как бэ сравнивание хэшированных
   *  данных - мы его проводим в другой функции и реализуем так как я описал).
   */
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))

  /**
   * This function makes serializing - which means "to store in one(during one) session"
   * For make this whole system work - we need to open this session and to call the done function
   * with arguments of user.id which use login method now.
   */
  passport.serializeUser((user, done) => done(null, user.id))

  /**
   * This function makes deserializing. Serializing means "to store in one(during one) session", so this will
   * close our session.
   * For make this whole system STOP work - we need to CLOSE this session and to call the done function
   * with arguments of user.id which is now using this system.
   */
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize