/**
 *There is fully another version of download files from the server
 * https://www.youtube.com/watch?v=ogF_WMzUqok - взято отсюда
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

/*
//const url = fs.readfile(path.join(__dirname, 'uploads', 'excelAutomations.js'));
//const url = path.join(__dirname+'/uploads'+'/excelAutomations.js');
//const url = path.join(__dirname, 'uploads', 'excelAutomations.js');
Nothing from this works
*/

function downloadFile(url, callback) {
    const filename = path.basename(url);

    const req = https.get(url, function (res) {
        /**
         * https://nodejs.org/dist/latest-v4.x/docs/api/fs.html#fs_fs_createwritestream_path_options
         * https://nodejs.org/dist/latest-v4.x/docs/api/stream.html#stream_class_stream_writable - The Writable stream interface is an abstraction for a destination that you are writing data to.
         * Returns a new WriteStream object. Options is an object or string with the following defaults
         * flags: 'w',
         defaultEncoding: 'utf8',
         fd: null,
         mode: 0o666
         options may also include a start option to allow writing data at some position past the beginning of the file.
         Modifying a file rather than replacing it may require a flags mode of r+ rather than the default mode w.
         The defaultEncoding can be any one of those accepted by Buffer.
         * @type {WriteStream}
         */
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        /**
         * When the stream.end() method has been called, and all data has been flushed
         * to the underlying system, this event is emitted.
         */
        fileStream.on("error", function (err) {
            console.log("Error writing to the stream");
            console.log(err);
    });
        /**
         * Emitted when the stream and any of its underlying resources (a file descriptor, for example) have been closed.
         * The event indicates that no more events will be emitted, and no further computation will occur.
         *Not all streams will emit the 'close' event as the 'close' event is optional.
         */
        fileStream.on("close", function(){
            callback(filename);
        })
        /**
         * When the stream.end() method has been called,
         * and all data has been flushed to the underlying system, this event is emitted.
         */
        fileStream.on("finish", function () {
            fileStream.close();
            console.log("Done!");
        });
    });
    req.on("error", function(err){
        console.log("Error downloading the file");
        console.log(err);
    });
}
downloadFile("https://images.pexels.com/photos/1036657/pexels-photo-1036657.jpeg", function(fn){
    console.log(fn)
});