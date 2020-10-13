const express = require('express');
const upload = require('express-fileupload');
const fs = require("fs");
var url = require('url');
const path = require('path');
const download = require("download");
var ROOT = __dirname + "/downloads";

const app = express();

var ROOT = __dirname + "/downloads";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/download', (req, res) => {
    if(!checkAccess(req)) {
        res.statusCode = 403;
        res.end("Tell me the secret to access!");
        return;
    }
    sendFileSafe(url.parse(req.url).pathname, res);

/*
If this method ^^^ doesn't work - you can comment that method and uncomment this and file will be
downloaded by the link localhost:3000/download
res.download('./uploads/excelAutomation.xlsx', "myNewFileName.xlsx")
 */
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
        res.download(filePath, "myNewFileName.xlsx");
    });
}
