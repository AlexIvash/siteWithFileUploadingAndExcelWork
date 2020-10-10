//npm install xlsx -D
const xlsx = require("xlsx");

let wb = xlsx.readFile("./uploads/excelAutomation.xlsx", {cellDates:true});
//Point at file and also add options to read date cell(when we read it file it will be returned
//in correct format, not simply general number, but a date).

let ws = wb.Sheets["Main Sheet"];//It means to open exactly "Main Sheet" sheet in the excelAutomation.xlsx file

var data = xlsx.utils.sheet_to_json(ws);//array which contains xlsx data in json format
/*console.log(data);//now it really easier to see json data in terminal instead of xlsx data in terminal*/

var newData = data.map(function(record){
    /*Метод map() створює новий масив з результатами виклику наданої функції на кожному елементі масиву, який викликав метод.
    Причем получается что здесь json записывается как массив
    Сейчас record - это записи из data.json
    */

var net = record.Sales - record.Cost;//it operates with exact column names in the raw(subtraction)
record.Net = net; //assigning a new object for this record. So later it will be a column
    delete record.Sales;
    delete record.Cost;
    //We delete columns which we don't need now
    return record;//and here we return record after all modifications are done
});//it creates a new array of data to work with
//record - it's an object which contains one raw of information (all one row - Date, Region, Brand, etc.)


var newWB = xlsx.utils.book_new();//here we create a new sheet in the excelAutomation file
//but this contains only new sheet

var newWS = xlsx.utils.json_to_sheet(newData);//here we converts all the json data into the sheet from newData function
xlsx.utils.book_append_sheet(newWB,newWS,"New Data");//it receive new workbook, data from variable which contains data of new json
//and here is new sheet name "New Data"

xlsx.writeFile(newWB, "New Data File.xlsx");//and this will create a new work book

console.log(wb.SheetNames);//it return name of sheets in file
/*console.log(ws);//it will tell us all basic info about excel sheet
//if it returns "undefined" - problem with sheet name or xlsx document has not been saved*/

/*console.log(newData);//Here we log new updated data
//here we can see that we make a subtraction from two columns and delete those columns after it.*/