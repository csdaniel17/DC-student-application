var app = require('express')();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

mongoose.connect('mongodb://localhost/dc-app');

var User = require("./dcmodel");

app.use(cors());

// use body parser with JSON
app.use(bodyParser.urlencoded({ extended: false}));

app.post('/upload', function(req, res) {
  //console.log('req.body is :', req.data);
  console.log(req);
  console.log(req.body.file);
  console.log(req.body.data);
  var file = req.data.file;
  console.log(file);
  res.status(200).json({"status": "ok", "data": file});
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
