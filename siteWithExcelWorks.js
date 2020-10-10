//Here I will try to make a new site which will be used for uploading excel and then downloading back updated excel

const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const fs = require('fs');

app.use(express.json())
const server = http.createServer ((req,res)=> {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'client', 'siteWithExcelWorks.html'), (err, data) => {
            if (err) {
                throw err
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            })
            console.log(req.url);

            res.end(data)
        });
    }
});
server.listen(3000, ()=>{
    console.log('Server has been started...')
});

/*
// GET
app.get('/api/excel', (req, res) => {
    setTimeout(() => {
        res.status(200).json(CONTACTS)
    }, 1000)
})*/


/*
app.use(express.static(path.resolve(__dirname, 'client')));
Better to check whole link about the express.use https://expressjs.com/en/guide/using-middleware.html
Эта функция выполняется каждый раз когда получает запрос и позволяет например продолжать выполнение работы сервера
если вдруг случилась ошибка которую не предусмотрели. Еще она может применять массив опций.
 */



/*
The root argument specifies the root directory from which to serve static assets. The function determines the file to serve by combining req.url
with the provided root directory. When a file is not found, instead of sending a 404 response,
it instead calls next() to move on to the next middleware, allowing for stacking and fall-backs.

As of express 4.x, express.static() is handled by serve-static package middleware. you can find its docs at npmjs.com/package/serve-static
or github.com/expressjs/serve-static*/

/*
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'siteWithExcelWorks.html'))
});
app.listen(3000, () => console.log('Server has been started on port 3000...'));
*/