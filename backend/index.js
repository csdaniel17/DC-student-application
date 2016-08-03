var app = require('express')();
var mongoose = require('mongoose');
var cors = require('cors');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var bcrypt = require('my-bcrypt');
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
  var buf;
  var userToken;


  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    file.on('data', function(data) {
      //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      //console.log('data: ', data);
      bufs.push(data);
    });
    file.on('end', function() {
      //console.log('File [' + fieldname + '] Finished');
      buf = Buffer.concat(bufs);
      //console.log('DONE: BUF IS: ', buf, ' and buf.length is: ', buf.length);
    });
  });

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    if (fieldname === 'token') {
      userToken = val;
    }
    //console.log('Field [' + fieldname + ']: value: ' + val);
  });

  busboy.on('finish', function() {
    User.update({ authenticationTokens: { $elemMatch: { token: userToken } } }, {
      $set: { resume: buf}
    }, function(err, response) {
      console.log('resume update', response);
      if (err) {
        return res.status(400).json({ status: 'fail', message: 'failed to save user resume' });
      }
      res.status(200).json({ status: 'ok' });
    });
  });

  req.pipe(busboy);

});

// save user answers to the database
app.post('/save', function(req, res) {
  var userToken = req.body.token;
  var userInfo = req.body;
  var setQuery;

  if (userInfo.page === 2) {
    setQuery = {
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      phone: userInfo.phone,
      birthday: userInfo.birthday,
      address: userInfo.address,
      city: userInfo.city,
      cohort: userInfo.cohort,
      relocating: userInfo.relocating
    };
  } else if (userInfo.page === 3) {
    setQuery = {
      education: userInfo.education,
      employment: userInfo.employment,
      loan: userInfo.loan,
      programming: userInfo.programming,
      interest: userInfo.interest,
      plan: userInfo.plan,
      why: userInfo.why
    };
  } else if (userInfo.page === 4) {
    setQuery = {
      github: userInfo.github,
      linkedin: userInfo.linkedin,
      portfolio: userInfo.portfolio,
      understand: userInfo.understand,
      effortagree: userInfo.effortagree
    };
  }
  User.update({ authenticationTokens: { $elemMatch: { token: userToken } } }, {
    $set: setQuery
  }, function(err, response) {
    console.log('page update', response);
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'failed to save user info' });
    }
    res.status(200).json({ status: 'ok' });
  });
});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
