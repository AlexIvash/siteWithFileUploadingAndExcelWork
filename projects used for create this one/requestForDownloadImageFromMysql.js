/**
ПРОСТО ПРИМЕР ЗАПРОСА
 *
 *
 * connection.query('INSERT INTO tasks (description) VALUES (?)', [req.body.item], (error, results)=>{
    if (error) return res.json({error: error});

    connection.query ('SELECT LAST_INSERT_ID() FROM tasks', (error, results) => {
        if (error) return res.json({error: error});



        res.json({

                id: results[0]['LAST_INSERT_ID()'],
                description: req.body.item
 */


//Все данные из POST запроса express /fileUploaded



//let pathToFile = path.join(__dirname+'/uploads'+'/excelAutomation.xlsx');

// console.log("I am in POST request 'fileUploaded'");

/*
connection.query("", function (error, result) {
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
})
*/
/**
 * В этой функции мы берем наш файл и обрабатываем его.
 * Файл пока только один и он захардкожен. Чтобы обработать другой файл - последние столбцы в нем
 * должны называться так же как называются здесь (check workOnFile please)
 */

/**
 Это про то - если выводить картинку на экране например
 response.writeHead(200, {
            'Content-Type': 'image/jpeg'
        });
 response.send(result);
 */
/**
 * Здесь после workFile нужно будет написать запрос который вставляет новый файл в колонку для новых файлов
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


/**
 Это - запросы которые были до того как мы загружали данные напрямую из таблицы
 //connection.query("SELECT file FROM media WHERE LAST_INSERT_ID()", function (error, result) {
    //  connection.query("SELECT LAST_INSERT_ID() FROM media", function (error, result) {
      //connection.query("SELECT file_name FROM media WHERE id = 16", function (error, result) {
          //connection.query("SELECT LOAD_FILE(file) FROM media WHERE id = 16", function (error, result) {
    //connection.query("SELECT LAST_INSERT_ID() FROM media", function (error, result) {
    //connection.query("SELECT \"LOAD_FILE(file)\" FROM media WHERE id = 16", function (error, result) {
    //connection.query("SELECT file FROM media WHERE id = 19", function (error, result) {



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