app.post('/fileUploaded', (req, res) => {
    /**TODO:нужно как-то проверить айдишники которые вставляли их возвращать здесь и из них именно и создавать файл который загружать
     TODO:и обрабатывать.
     TODO: Если в бд есть другие записи - уведомлять о них так же.
     */
    connection.query("SELECT * FROM excel WHERE id = 5", function (error, result) {
        if (error) {
            console.log(error);
            throw error;
        }
        console.log("I am in POST request '/fileUploaded' in connection query method");
        console.log(result[0][4]);//returns undefined
        console.log(result[0]['sales']);//returns 15
        console.log(result['sales']);//returns undefined
        console.log(result);//returns whole data with the region, brand, state, cost, sales. id
        console.log(result[0].sales);//returns 15
        console.log(result[0]);//returns whole json data
        console.log(result[0].JSON);//returns undefined
        //  console.log(result[0]['id','added_date','region','brand','state','cost','sales']);//returns exactly "15" 0_o
        //console.log(result[0]['id']['added_date']['region']['brand']['state']['cost']['sales']);// Cannot read property 'region' of undefined
        //console.log(result[0]['id']['added_date']['brand']['state']['cost']['sales']);//// Cannot read property 'brand' of undefined
        let jsonData = result;//правильный вариант того как выглядит запрос в базу данных

        /**
         Здесь мы создаем новый файл с данными из бд и сохраняем его в директорию проекта - потом передаем его в workOnFile функцию
         */


        var newWB = xlsx.utils.book_new();
        var newWS = xlsx.utils.json_to_sheet(jsonData);
        xlsx.utils.book_append_sheet(newWB,newWS,"New Data");

        xlsx.writeFile(newWB, "./downloads/newDataFile1.xlsx");

        let pathToFile = path.join(__dirname+'/downloads'+'/newDataFile1.xlsx');

        /**
         * сюда мы будем передавать новосозданный файл с данными из базы данных.
         */
        workOnFile(pathToFile, res);
        /*
        /Users/oleksandr.ivashchenko/PhpstormProjects/projectDownloadAndWorkExcel/fileUploadingVersionThreeLoginWithSQL.js:286
        console.log(result[0].file);
                              ^

TypeError: Cannot read property 'file' of undefined

*/
    })
});