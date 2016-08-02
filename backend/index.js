var app = require('express')();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dc-app');
var User = require("./dcmodel");

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
