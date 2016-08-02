var app = require('express')();
var Busboy = require('busboy');

app.get('/', function(req, res){
  res.end('<html><head></head><body>\
             <form method="POST" enctype="multipart/form-data">\
             <input type="file" name="file">\
              <input type="submit">\
            </form>\
          </body></html>');
        });
app.post('/', function(req, res){
  var busboy = new Busboy({ headers: req.headers });
busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
  console.log('File [' + fieldname + ']: filename: ' + filename);
  file.on('data', function(data) {
    console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
  });
  file.on('end', function() {
    console.log('File [' + fieldname + '] Finished');
  });
});
busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
  console.log('Field [' + fieldname + ']: value: ', val);
});
busboy.on('finish', function() {
  console.log('Done parsing form!');
  res.end('ok');
});
req.pipe(busboy);
});
app.listen(5000, function(){

});
