var app = require('express')();
var mongoose = require('mongoose');
var cors = require('cors');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var bcrypt = require('my-bcrypt');
var randtoken = require('rand-token');
var creds = require('./creds.json');
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport('smtps://dcapptesting%40gmail.com:' + creds.password +'@smtp.gmail.com');

mongoose.connect('mongodb://localhost/dc-app');

var User = require("./dcmodel");
var Setting = mongoose.model('Setting', {});

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
    if (user.forcePasswordReset) {
      return res.status(201).json({ status: "OK"});
    } else {
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
    }
  });
});

// handle resume upload
app.post('/upload', function(req, res) {

  var bufs = [];
  var buf;
  var userToken;
  var resumeName;

  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    resumeName = filename;
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
      $set: { resume: buf, resumeName: resumeName }
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
      relocating: userInfo.relocating,
      howDidYouHear: userInfo.optionsSelected
    };
    console.log(setQuery);
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

  // update user in db
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

// retrieve saved data (if any) for a specific user
app.post('/getdata', function(req, res) {
  var userToken = req.body.token;
  // find user by the token and get data
  User.findOne({ authenticationTokens: { $elemMatch: { token: userToken } } }, '-resume -password -authenticationTokens', function(err, user) {
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'Unable to retrieve data'});
    }
    res.status(200).json({ status: 'ok', message: user });
  });
});

// get options for "How did you hear about DigitalCrafts?"
app.post('/getAppOptions', function(req, res) {

  //57a24198bed744ac55120057 is id of record holding 'how did you hear..' options
  Setting.findById('57a24198bed744ac55120057', function(err, options) {
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'Unable to retrieve options'});
    }
    res.status(200).json({ status: 'ok', message: options });
  });
});

// handle resetting a user's password
app.post('/resetPassword', function(req, res) {

  // attempt to find user by email
  var userEmail = req.body.email;
  User.findOne({ email: userEmail }, 'email')
    .then(function(user) {
      if (!user) {
        return res.status(400).json({ status: 'fail', message: 'No user found'} );
      }
      // user found
      // generate new random password for the user
      var tempPassword = randtoken.generate(8);
      // Email settings
      var mailOptions = {
        from: 'dctester@noreply.com',
        to: userEmail,
        subject: 'DigitalCrafts Temporary Password',
        text: 'Here is your temporary password: ' + tempPassword +
        'Please login with your temporary password. You will then ' +
        'be required to change your password and login again. ' +
        'Thanks, DigitalCrafts' ,
        html: '<p>Here is your temporary password: <b>' + tempPassword +
        '</b><br> Please login with your temporary password at the link ' +
        ' below. After logging in you will be required to change your password ' +
        'and login again. <br><a href="http://localhost:3000/">Click to Login</a>'
      };

      // Email sender
      transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          return console.log(err);
        }
        //console.log('Message sent: ', info.response);

        // save temp password and set some flag
        user.forcePasswordReset = true;
        bcrypt.hash(tempPassword, 10, function(err, hash) {
          if (err) {
            console.log('error in bcrypt hash:', err.message);
            return;
          }
          user.password = hash;
          user.save(function(err){
            if (err) {
              console.log(err.message);
              res.status(409).json({
                status: 'fail',
                message: "Error saving new password"
              });
              return;
            }
            res.status(200).json({status: "OK"});
          });
        });
      });
    })
    .catch(function(err) {
      console.log(err);
    });

});

// handle users changing password
app.post('/changepassword', function(req, res) {
  var userEmail = req.body.email;
  var newPassword = req.body.password;
  User.findOne({ email: userEmail }, '-resume')
  .then(function(user) {
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'No user found'} );
    }
    user.forcePasswordReset = false;
    bcrypt.hash(newPassword, 10, function(err, hash) {
      if (err) {
        console.log('error in bcrypt hash:', err.message);
        return;
      }
      user.password = hash;
      user.save(function(err){
        if (err) {
          console.log(err.message);
          res.status(409).json({
            status: 'fail',
            message: "Error saving new password"
          });
          return;
        }
        res.status(200).json({status: "OK"});
      });
    });
  })
  .catch(function(err) {
    console.log(err);
  });

});

// handle sending emails of completed applications
app.post('/complete', function(req, res) {

  var userToken = req.body.data;
  User.findOne({ authenticationTokens: { $elemMatch: { token: userToken } } })
    .then(function(user) {
      if (!user) {
        res.status(400).json({ status: 'fail', message: 'User not found' });
      }
      var howdidtheyhear = '';
      user.howDidYouHear.forEach(function(option) {
        howdidtheyhear += option + ",";
      });
      howdidtheyhear = howdidtheyhear.substring(0, howdidtheyhear.length - 1);
      console.log(howdidtheyhear);

      var emailBody = '<p>An application has been submitted from ' + user.firstname + ' ' + user.lastname + '</p>' +
      '<ul>' +
      '<li>Email: ' + user.email + '</li>' +
      '<li>Phone: ' + user.phone + '</li>' +
      '<li>Birthday: ' + user.birthday + '</li>' +
      '<li>Address: ' + user.address + '</li>' +
      '<li>Cohort City: ' + user.city + '</li>' +
      '<li>Cohort Date: ' + user.cohort + '</li>' +
      '<li>Relocating? ' + user.relocating + '</li>' +
      '<li>GitHub: ' + user.github + '</li>' +
      '<li>LinkedIn: ' + user.linkedin + '</li>' +
      '<li>Portfolio: ' + user.portfolio + '</li>' +
      '<li>Education: ' + user.education + '</li>' +
      '<li>Employment: ' + user.employment + '</li>' +
      '<li>Loan? ' + user.loan + '</li>' +
      '<li>Programming experience: ' + user.programming + '</li>' +
      '<li>Interest in program: ' + user.interest + '</li>' +
      '<li>Plan after graduation: ' + user.plan + '</li>' +
      '<li>Why is DigitalCrafts the right fit? ' + user.why + '</li>' +
      '<li>How did they hear? ' + howdidtheyhear + '</li>' +
      '</ul>' +
      'Thanks, <br>' +
      'The Dream Team';


      // Email settings
      var mailOptions = {
        from: 'dctester@noreply.com',
        to: 'dcapptesting@gmail.com',
        subject: 'DigitalCrafts Application Submitted',
        text: 'TEST',
        html: emailBody,
        attachments: [{ filename: user.resumeName, content: user.resume }]
      };

      // Email sender
      transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          return console.log(err);
        }
        console.log('Message sent: ', info.response);
      });

    })
    .catch(function(err) {
      if (err) {
        console.log(err);
      }
    });
});


app.listen(8000, function() {
  console.log('Listening on port 8000');
});
