const path = require('path');
const fs = require('fs');
const express = require('express');
const document = require('./client/siteWithExcelWorks.html');

const app = express();



app.use(express.json())


document.getElementById("btn-upload-Excel").onclick = function() {
    uploadExcelFile();
};

function uploadExcelFile(){
    const filePath = path.join(__dirname, 'client','excelAutomation.xlsx');
    const filePathText = path.join(__dirname, 'client','text.txt');
    const fileReaded = fs.readFileSync(filePath, 'utf-8');
    const fileReadedText = fs.readFileSync(filePathText, 'utf-8');
    console.log(fileReaded);
    console.log(fileReadedText);
    console.log("upload was successfull")
    /*
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            throw err
        }
        console.log(content);



    });*/
}