var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var ROOT = __dirname + "/uploads";

/**
 * Taken from there: http://imnotgenius.com/24-bezopasnyj-put-k-fajlu-v-fs-i-path/
 * You can try to get access to server after start with this url: http://localhost:3000/index.html?secret=o_O
 * or
 * http://localhost:3000/test.jpg?secret=o_O
 * or
 * http://localhost:3000/excelAutomation.xlsx?secret=o_O - ТОГДА НАЧНЕТСЯ СКАЧИВАНИЕ ФАЙЛА
 * or
 * http://localhost:3000/uploads/excelAutomation.xlsx?secret=o_O - этот файл не сработает. Потому что ниже есть переменная ROOT
 * у которой уже указана папка в которой искать наши данные в том числе и этот файл. И наша ошибка в том что мы тут его указываем
 * еще раз
 */

http.createServer(function(req, res){

    if(!checkAccess(req)){
        res.statusCode = 403;
        res.end("Tell me the secret to access!");
        return;
        /*
        В этой функции мы вызываем проверку url-a. Так как эта функция находится первой в создании сервера - она первой
        вызовется и проверит url на наличия в нем секрета*/
    }

    sendFileSafe(url.parse(req.url).pathname, res);
    /*Здесь если запрос содержит правильный секрет(из метода выше) - мы вызываем функцию sendFileSafe в аргументах которой
    url.parse(req.url).pathname == переменной pathName( Фактически здесь мы инициализируем эту переменную) в параметрах к
    методу sendFileSafe, а res - это мы отдаем право функции sendFileSafe оперировать ответами сервера.

    The pathname property of the URL interface is a USVString containing an initial '/' followed by the path of the URL
    (or the empty string if there is no path).
    example of url.pathname working:
 const url = new URL('https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname?q=value');
console.log(url.pathname); // Logs "/en-US/docs/Web/API/URL/pathname"

То есть исходя из описанного выше наш url - это некий url который содержит секрет и содержит сам путь к конкретному файлу.
То есть url выглядит вот так вот:
http://localhost:3000/uploads/excelAutomation.xlsx?secret=o_O

    */

}).listen(3000);

/**
 * Важно заметить - этот метод проверяет что в urle после знака вопроса содержится "secret=o_O".
 * Получается что запрос в бд "query" = "?" в url?  И если этих данных нет в urk - выдаст 403 ошибку(код выше)
 * @param req
 * @returns {boolean}
 */

function checkAccess(req){
    return url.parse(req.url, true).query.secret == 'o_O';
   // url.parse - это мы парсим url запроса на предмет наличия в нем secret.
}

/**
 *Эта функция состоит из нескольких шагов. На первом шаге я пропускаю путь через decodeURIComponent(filePath),
 * ведь по стандарту http многие символы кодируются, в частности русская буква «я» будет иметь вот такой вид в url
 * -«%D1%8F» и это корректно. Получив такой url мы обязаны его декодировать обратно в русскую букву «я» при помощи
 * вызова decodeURIComponent(…. ), при этом если url закодирован неверно, то возникнет ошибка, которую необходимо
 * поймать и обработать. В catch мы как раз указываем, resStatusCode = 400, что означает, что url некорректен,
 * запрос неверен, можно конечно и просто вернуть res.statusCode = 404.
 * @param filePath
 * @param res
 */

function sendFileSafe(filePath, res){
    /**
     * Далее когда мы раскодировали запрос, время его проверить.
     * есть такой специальный нулевой байт, который, по идее, в строке url присутствовать не должен. Если он есть,
     * это означает, что кто то его злонамеренно передал, потому что некоторые встроенные функции Node.JS будут работать
     * с таким байтом некорректно. Соответственно, если такой байт есть, то мы тоже возвращаем- до свидание,
     * запрос некорректен.
     *
     * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent -
     * Метод decodeURIComponent() декодирует управляющие последовательности символов в компоненте Uniform Resource Identifier
     * (URI), созданные с помощью метода encodeURIComponent или другой подобной процедуры. То есть если мы раскодируем url
     * и словим ошибку - то увидим status code ==400. Это то как мы проверяем наш filePath
     */

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

    /**
     * Теперь настало получить полный путь к файлу на диске. Для этого мы будем использовать модуль path.
     * Этот модуль содержит пачку самых разных функций для работы с путями. Например join объединяет пути,
     * normalize — удаляет из пути, всякие странные вещи типа «.» «..» «\\» и так далее, то есть делает путь более
     * корректным. Если url который передал юзер выглядел так — «/deep/nodejs.jpg», то после join  с ROOT,
     * который представляет собой вот эту — «var ROOT = __dirname + «/uploads»» директорию, он будет выглядеть уже по
     * другому — «C:\node\server\public\deep\nodejs.jpg»
     * То есть по большому счету path.join просто делает конкатинацию двух аргументов? На самом деле нет.
     * И если у нас ROOT == __dirname + '/uploads' то filePath равен "url.parse(req.url).pathname"
     * что == http://localhost:3000/excelAutomation.xlsx?secret=o_O . То есть path join
     * соединяет ROOT(__dirname + «/uploads») с localhostlocalhost:3000/excelAutomation.xlsx?secret=o_O ? И имеем
     * __dirname + «/uploads»localhostlocalhost:3000/excelAutomation.xlsx?secret=o_O ? Нет. path.join - это не конкатинация
     * а указание соответствия между переменной ROOT (которая содержит путь к корневой папке к проекта ) с доменным именем (localhostlocalhost:3000)
     * Потому когда user делает запрос  "http://localhost:3000/excelAutomation.xlsx?secret=o_O" - он просит вытащить "__dirname/uploads/excelAutomation.xlsx"
     * и еще и прописывает секрет по которому получит доступ к этой папке. Вот для чего нужен path.join
     */

    filePath = path.normalize(path.join(ROOT, filePath));

    /**
     * Наша следующая задача это убедится, что путь действительно находится внутри директории uploads.
     * Сейчас, когда у нас уже есть абсолютно точный, корректный абсолютный путь, это сделать очень просто — достаточно
     * всего лишь проверить, что в начале находится вот такой вот префикс —  «C:\node\server\public\» то есть, что путь
     * начинается с ROOT. Проверяем и если это не так, то до свидание файла нет. То есть метод сканирует с помощью строки
     * filePath(хотя мне кажется - он проверяет что перед этой строкой лежит строка "ROOT".
     * Вот пример работы этого метода из инета:
     * function findIndex(str) {
    var index = str.indexOf("awesome");
    console.log(index);
}

     var str = "gfg is awesome";

     findIndex(str);
     */

    if(filePath.indexOf(ROOT) != 0){
        res.statusCode = 404;
        res.end("File not found");
        return;
    }

    /**
     * Далее, если путь разрешен, то проверим,
     * что по нему лежит. Если ничего нет, то fs.stat вернет ошибку ну или если даже ошибки нет, то нужно проверить
     * файл ли это. В том случае если это не файл — ошибка, ну а если файл, то все проверено, там файл,
     * надо его отослать. Это делает вложенный вызов sendFile(…. ).
     *
     * The fs.stat() method is used to return information about the given file or directory.
     * It returns an fs.Stat object which has several properties and methods to get details about the file or directory.
     * Syntax: fs.stat( path, options, callback )
     * This method accept three parameters as mentioned above and described below:

     path: It holds the path of the file or directory that has to be checked. It can be a String, Buffer or URL.
     options: It is an object that can be used to specify optional parameters that will affect the output. It has one optional parameter:
     bigint: It is a boolean value which specifies if the numeric values returned in the fs.Stats object are bigint. The default value is false.
     callback: It is the function that would be called when the method is executed.
     err: It is an error that would be thrown if the method
     stats: It is the Stats object that contains the details of the file path.
     */

    fs.stat(filePath, function(err, stats){
        if(err || !stats.isFile()){
            res.statusCode = 404;
            res.end("File not found");
            return;
        }

        /**
         * sendFile(…. ), функция которая есть в этом же файле чуть чуть ниже.
         * Она для чтения файла использует вызов fs.readFile(…. ) и когда он будет прочитан, то выводит его через res.end(…).
         * Обращаю ваше внимание вот на что, во первых ошибка в этом callback очень мало вероятна, хотя бы
         * потому что мы уже проверили, что файл есть, это действительно файл, то есть его можно отдать, но тем не менее
         * мало ли что, например может возникнуть ошибка при чтении с диска, так или иначе, как то обработать ошибку
         * надо — «if (err) throw err» .
         */

        sendFile(filePath, res);
    });
}

/**
 * Далее, мало просто считать содержимое файла и отправить его, ведь различные файлы должны снабжаться различными
 * заголовками contant-type — «res.setHeader(‘Content-Type’, mime + «; charset=utf-8″)». Например html файл должен иметь
 * тип text/html, файл с картинкой jpg — image/jpg и так далее. Нужный тип файла определяется по расширению с использованием
 * модуля «mime», для того чтоб это работало, нужно его поставить дополнительно «npm install mime», и затем вызвать.
 * Ну и на конец последнее: эта глава была сосредоточена на том, чтобы корректно работать с путем от посетителя,
 * чтобы сделать все необходимые проверки, но что касается отдачи файла, этот код не верен, я про функцию sendFile(… ),
 * потому что readFile полностью прочитывает файл и потом в content его отсылает. А представьте, что будет если файл очень большой,
 * а если он превышает количество свободной памяти, вообще же все упадет. По этому для того чтобы отсылать файл нужно либо
 * дать команду специализированному серверу, либо использовать потоки которые мы рассмотрим в следующих главах.
 * @param filePath
 * @param res
 */

function sendFile(filePath, res){
    fs.readFile(filePath, function(err, content){
        if (err) throw err;

        var mime = require('mime').lookup(filePath);
        res.setHeader('Content-Type', mime + "; charset=utf-8");
        res.end(content);
    });
}