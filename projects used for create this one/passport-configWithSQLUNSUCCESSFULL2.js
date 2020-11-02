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

function initialize(passport, databaseUserEmail, databaseUserPassword) {



  const authenticateUser = async (email, password, done) => {
    console.log("I am password entered in field " + password);

    const user = databaseUserEmail;


    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }



    try {

      let userPassword = databaseUserPassword;
      console.log("I am user password from fileUploading " + userPassword);


      /**
       * И так, решение неуспешного вариант будет в успешной версии. В этом файле я хочу показать что здесь я не нашел ни единого варианта как через promise вернуть значение
       * через sql. Потому я решил что самым хорошим вариантом будет размещать brypt.compare внутри sql запроса - как я и сделаю в успешном варианте.
       *
       * решение взято отсюда:
       https://stackoverflow.com/questions/55435263/how-to-compare-a-password-with-a-hashed-one-in-database-when-sign-uppass-hashin


       let name = post.user_name;
       let password = post.password;
       // TODO: rename "password" column to "password_hash"
       let sql = "SELECT id, password, first_name, last_name, user_name FROM `users` WHERE `user_name`=?";
       //                    ^^^^^^^^               prevent SQL injection by using parameterised query ^

       db.query(sql, name, function(err, results) {
  if(!err && results.length) {
    var hash = results[0].password;
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    bcrypt.compare(password, hash, function(err, ok) {
      if (!err && ok) {
        req.session.userId = results[0].id;
        req.session.user = results[0];
        …
      } else{
        …
      }
    });
  } else {
    …
  }
});

       */



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

      if (await bcrypt.compare(password, userPassword))
       {
           console.log("I am user password from fileUploading which is from database " + databaseUserPassword);

         console.log("Compare password from POST request and database was successfull");
         return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, authenticateUser))


  passport.serializeUser((databaseUserEmail, databaseUserPassword, done) => done(null, databaseUserEmail))


  passport.deserializeUser((databaseUserEmail,databaseUserPassword, done) => {
    return done(null, databaseUserEmail,databaseUserPassword)
  })
}


module.exports = initialize