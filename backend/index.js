var app = require('express')();
var mongoose = require('mongoose');
var cors = require('cors');
var Busboy = require('busboy');

mongoose.connect('mongodb://localhost/dc-app');

var User = require("./dcmodel");

app.use(cors());

// use body parser with JSON
//app.use(bodyParser.urlencoded({ extended: false}));

app.post('/upload', function(req, res) {

  var bufs = [];
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    file.on('data', function(data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      console.log('data: ', data);
      bufs.push(data);
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      var buf = Buffer.concat(bufs);
      console.log('DONE: BUF IS: ', buf, ' and buf.length is: ', buf.length);
      var user = new User({resume: buf});
      user.save(function(err){
        if (err) {
          console.log(err);
        }
      });
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });
  busboy.on('finish', function() {
    console.log('Done parsing form!');
    res.writeHead(303, { Connection: 'close', Location: '/' });
    res.end();
  });
  req.pipe(busboy);
});

app.post('/userData', function(req, res) {

});
app.listen(8000, function() {
  console.log('Listening on port 8000');
});
