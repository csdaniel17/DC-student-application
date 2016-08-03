var app = require('express')();
var mongoose = require('mongoose');
var cors = require('cors');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');


mongoose.connect('mongodb://localhost/dc-app');

var User = require("./dcmodel");

app.use(cors());

// use body parser with JSON
app.use(bodyParser.json());

// handle signup requests
app.post('/signup', function(req, res) {
  var userInfo = req.body;
  bcrypt.hash(userInfo.password, 10, function(err, hash) {
    if (err) {
      console.log('error in bcrypt hash:', err.message);
      return;
    }
    var user = new User({
      email: userInfo.email,
      password: hash
    });

    user.save(function(err){
      if (err) {
        console.log(err.message);
        res.status(409).json({
          status: 'fail',
          message: "Username has been taken"
        });
        return;
      }
      res.json({
        status: "OK"
      });
    });
  });
});

// handle login requests
app.post('/login', function(req, res) {
  email = req.body.email;
  password = req.body.password;
  console.log('entered email & password:', email, password);
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return res.status(400).json({ status: "fail", "message": "System error. Please try again."});
    }
    if (!user) {
      return res.status(400).json({ status: "fail", "message": "Incorrect username or password."});
    }

    bcrypt.compare(password, user.password, function(err, matched) {
      if (err) {
        console.log(err);
        res.status(400).json({ status: "fail" });
      }
      console.log('matched is: ', matched);
      if (matched) {
        // login successfull
        var token = randtoken.generate(64);
        // set token to expire in 10 days
        user.authenticationTokens.push({ token: token, expiration: Date.now() + 1000 * 60 * 60 * 24 * 10 });
        user.save(function(err) {
          if (err) {
            console.log('Error saving auth token.');
          }
          res.status(200).json({ status: "ok", "token": token });
        });
      } else {
        res.status(400).json({ status: "fail", message: "Incorrect username or password."});
      }
    });
  });
});

// handle resume upload
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

// save user answers to the database
app.post('/save', function(req, res) {
  console.log(req.body);
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
