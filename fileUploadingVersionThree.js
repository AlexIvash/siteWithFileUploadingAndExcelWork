const express = require('express');
const upload = require('express-fileupload');
const fs = require("fs");
const path = require('path');
const download = require("download");

/**
 * Every of these express libraries should be installed. I mean "npm I express -D; npm I express-fileupload -D"
 * @type {*|Express}
 */
const app = express();
app.use(upload());
/**
 * There we will connect this js file with the html file. SO when browser opens a page(makes a get request) - there will be returned our html file./
 * That how we works with js and html files.
 * The middleware is anything that contains request and responce
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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

