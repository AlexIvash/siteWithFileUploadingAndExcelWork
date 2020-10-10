console.log("test");
let button = document.getElementById('downloadButton');
button.addEventListener('click', function(e){
    let filename = "newExcel.xlsx";
    //  let excel = "Some data which I wrote manually in my IDEA"; - this work. This method works if
    //we just point it in script insed html without link to exactly this file.
    //here we need to point exactly at file which we want to download. We need to use fs.
    let excel = path.join(__dirname+'/uploads'+'/fexcelAutomations.js');
    download(excel, filename);
});

function download(excel, filename){
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(excel));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}