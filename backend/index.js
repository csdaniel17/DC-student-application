var app = require('express')();
var mongoose = require('mongoose');
var cors = require('cors');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var bcrypt = require('my-bcrypt');
var randtoken = require('rand-token');
var creds = require('./creds.json');
var nodemailer = require('nodemailer');
var Sandbox = require('sandbox');

var transporter = nodemailer.createTransport('smtps://dcapptesting%40gmail.com:' + creds.password +'@smtp.gmail.com');

mongoose.connect('mongodb://localhost/dc-app');

var User = require('./dcmodel');
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
    var token = randtoken.generate(64);
    // set token to expire in 10 days
    user.authenticationTokens.push({ token: token, expiration: Date.now() + 1000 * 60 * 60 * 24 * 10 });

    user.save(function(err){
      if (err) {
        console.log(err.message);
        res.status(409).json({
          status: 'fail',
          message: 'Username has been taken'
        });
        return;
      }
      res.json({ status: 'ok', 'token': token });
    });
  });
});

// handle login requests
app.post('/login', function(req, res) {

  email = req.body.email;
  password = req.body.password;

  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'System error. Please try again.' });
    }
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Incorrect username or password.' });
    }
    if (user.forcePasswordReset) {
      return res.status(201).json({ status: 'ok' });
    } else {
      bcrypt.compare(password, user.password, function(err, matched) {

        if (err) {
          console.log(err);
          res.status(400).json({ status: 'fail' });
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
            res.status(200).json({ status: 'ok', 'token': token });
          });
        } else {
          res.status(400).json({ status: 'fail', message: 'Incorrect username or password.' });
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
      howDidYouHear: userInfo.optionsSelected,
      pageLastCompleted: 2
    };
  } else if (userInfo.page === 3) {
    setQuery = {
      education: userInfo.education,
      employment: userInfo.employment,
      loan: userInfo.loan,
      programming: userInfo.programming,
      interest: userInfo.interest,
      plan: userInfo.plan,
      why: userInfo.why,
      pageLastCompleted: 3
    };
  } else if (userInfo.page === 4) {
    setQuery = {
      github: userInfo.github,
      linkedin: userInfo.linkedin,
      portfolio: userInfo.portfolio,
      understand: userInfo.understand,
      effortagree: userInfo.effortagree,
      pageLastCompleted: 4
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
      return res.status(400).json({ status: 'fail', message: 'Unable to retrieve data' });
    }
    res.status(200).json({ status: 'ok', message: user });
  });
});

// get options for "How did you hear about DigitalCrafts?"
app.post('/getAppOptions', function(req, res) {

  //57a24198bed744ac55120057 is id of record holding 'how did you hear..' options
  Setting.findById('57a24198bed744ac55120057', function(err, options) {
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'Unable to retrieve options' });
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
        return res.status(400).json({ status: 'fail', message: 'No user found' });
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
        'and login again. <br><a href="http://localhost:3000/frontend">Click to Login</a>'
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
                message: 'Error saving new password'
              });
              return;
            }
            res.status(200).json({ status: 'ok' });
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
      return res.status(400).json({ status: 'fail', message: 'No user found' });
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
            message: 'Error saving new password'
          });
          return;
        }
        res.status(200).json({ status: 'ok' });
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

      // concatenate array of 'how did you hear about us' options into a string
      var howdidtheyhear = user.howDidYouHear.join(', ');

      // update applicationCompleted flag true
      user.applicationCompleted = true;
      user.save(function(err) {
        if (err) {
          console.log('Unable to save applicationCompleted flag: ', err);
        }
      });

      // compose email body
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
      '</ul>';


      // only attach user resume if exists
      var resume = [];
      if (user.resume) {
        resume.push({ filename: user.resumeName, content: user.resume });
      }
      // Email settings
      var mailOptions = {
        from: 'dcapptesting@gmail.com',
        to: 'dcapptesting@gmail.com',
        subject: 'DigitalCrafts Application Submitted',
        text: 'TEST',
        html: emailBody,
        attachments: resume
      };

      // Email sender
      transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          return res.status(100).json({ status: 'fail', message: 'Unable to send email.' });
        }
        res.status(200).json({ status: 'ok' });
        console.log('Message sent: ', info.response);
      });

    })
    .catch(function(err) {
      if (err) {
        console.log(err);
      }
    });
});

// code challenge has been saved and submitted
app.post('/testCodeChallenge', function(req, res) {
  var code = req.body.code;

  var userToken = req.body.token;
  User.findOne({ authenticationTokens: { $elemMatch: { token: userToken } } })
    .then(function(user) {
      var s = new Sandbox();
      s.run(code, function(output) {

        /*
          First check if output.result === 'TimeoutError'. This is the result
          if an infinite loop exists, for example.

          Syntax error results in output.result = SyntaxError: ...

          output.result === null if no output

          Inspect the output of the sandbox. It should be in the format:
          [ [ 'Kyle Luck', 35 ],
            'Hello!',
            [ 'Kyle', 'Luck' ],
            'Hello, Kyle',
            36,
            6250000
          ]
        */

        var fullName = output.console[0][0];
        var age = output.console[0][1];
        var splitName = fullName.split(" ");
        var firstLastArray = output.console[2];
        var year = new Date().getFullYear();
        var numCorrect = 0;

        if (output.result === 'TimeoutError') {
          // possible infinite loop
          user.codeChallengeCompleted = true;
        } else if (output.result.indexOf('SyntaxError') > -1) {
          // syntax error
          user.codeChallengeCompleted = true;
        } else {

          // question 2: check that first element in result array is an array of a String and an Integer
          if (output.console[0].length === 2) {
            if (typeof fullName === 'string' && typeof age === 'number') {
              numCorrect += 2;
              user.codeChallengeAnswers[1] = true;
              user.codeChallengeAnswers[2] = true;
            }
          }

          // question 3: check that the second element in the result array is similar to Hello!
          var secondElement = output.console[1].toLowerCase();
          if (secondElement.indexOf('hello') > -1) {
            numCorrect++;
            user.codeChallengeAnswers[3] = true;
          }

          // question 4: check that the third element in the array is two elements
          if (firstLastArray.length === 2) {
            var questionFour = true;
            for (var i = 0; i < firstLastArray.length; i++) {
              if (firstLastArray[i] !== splitName[i]) {
                questionFour = false;
              }
            }
            if (questionFour) {
              numCorrect++;
              user.codeChallengeAnswers[4] = true;
            }
          }

          // question 5: check that fourth element in the array is similar to hello + output.console[0][0]
          var fourthElement = output.console[3].toLowerCase();

          if (fourthElement.indexOf('hello') > -1 && fourthElement.indexOf(splitName[0].toLowerCase()) > -1) {
            numCorrect++;
            user.codeChallengeAnswers[5] = true;
            console.log('outputing Hello + name! ok');
          }

          // question 6: check that fifth element is equal to output.console[0][1]
          if (output.console[4] == age || output.console[4] == age + 1 || output.console[4] == age - 1) {
            numCorrect++;
            user.codeChallengeAnswers[6] = true;
            console.log('age matches');
          }

          // question 7: check that sixth element equals 6250000
          if (output.console[5] === 6250000) {
            numCorrect++;
            user.codeChallengeAnswers[7] = true;
            console.log('sum odd numbers ok');
          }
          console.log('score is: ', numCorrect);
          user.codeChallengeAnswers.numCorrect = numCorrect;
          user.codeChallengeCompleted = true;

        }
        user.save(function(err) {
          if (err) {
            console.log(err);
          }
        });

        // send email notifying DC of code challenge completion

        // Email settings
        var emailText = user.firstname + " " + user.lastname +
          " has completed their code challenge. " +
          user.codeChallengeAnswers.numCorrect +
          " out of 7 questions were answered correctly.";

        var codeFilename = user.firstname + "_" + user.lastname +
        "_code_challenge.txt";

        var mailOptions = {
          from: 'dcapptesting@gmail.com',
          to: 'dcapptesting@gmail.com',
          subject: 'DigitalCrafts Code Challenge Completed',
          text: emailText,
          html: emailText,
          attachments: [{ filename: codeFilename, content: code }]
        };

        // Email sender
        transporter.sendMail(mailOptions, function(err, info) {
          if (err) {
            return res.status(100).json({ status: 'fail', message: 'Unable to send email.' });
          }
          res.status(200).json({ status: 'ok' });
          console.log('Message sent: ', info.response);
        });

        res.status(200).json({ status: 'ok' });
      });
    })
    .catch(function(err) {
      res.status(400).json({ status: 'fail', message: 'Invalid token' });
    });

});

// interview has been scheduled for this user, update the db
app.post('/interviewScheduled', authRequired, function(req, res) {

  var userToken = req.body.token;
  var user = req.user;

  user.interviewScheduled = true;
  user.save(function(err) {
    if (err) {
      return res.status(400).json({ status: 'fail', message: 'Failed to save that user completed their interview.' });
    }
    res.status(200).json({ status: 'ok' });
  });

});

app.post('/deleteToken', function(req, res) {

  var token = req.body.token;

  // remove token from authenticationTokens array
  User.update(
    { authenticationTokens: { $elemMatch: { token: token } } },
    { $pull: { authenticationTokens: {token: token } } } )
    .then(function(user) {
      res.status(200).json({ status: 'ok' });
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.post('/isTokenExpired', function(req, res) {

  var token = req.body.token;

  User.findOne(
    //check if token exists and hasn't expired
    { authenticationTokens: { $elemMatch: { token: token, expiration: { $gt: Date.now() } } } })
    .then(function(user) {
      if (user) {
        res.status(200).json({ status: 'ok' });
      } else {
        res.status(401).json({ status: 'fail', message: 'Session expired.' });
      }
    })
    .catch(function(err) {
      console.log(err);
    });

});

// verify user is an admin
app.post('/admin', authRequired, function(req, res) {

  var user = req.user;
  if (!user.administrator) {
    res.status(401).json({ status: 'fail' });
  }
  res.status(200).json({ status: 'ok' });

});

// get admin portal data
app.post('/adminData', function(req, res) {
  User.find({ administrator: false })
    .then(function(users) {
      // roll up user data:

      var numInProgress = 0,
          numAtChallenge = 0,
          numAtInterview = 0,
          questions = [0, 0, 0, 0, 0, 0, 0];

      users.forEach(function(user) {

        // number of applications in process
        if (!user.applicationCompleted) {
          numInProgress++;
        }

        // number on code challenge
        if (user.applicationCompleted && !user.codeChallengeCompleted) {
          numAtChallenge++;
        }

        // number on interview
        if (user.codeChallengeCompleted && !user.interviewScheduled) {
          numAtInterview++;
        }
        // average # of code challenge answers correct
        if (user.codeChallengeCompleted) {
          if (user.codeChallengeAnswers[1]) {
            questions[0]++;
          }
          if (user.codeChallengeAnswers[2]) {
            questions[1]++;
          }
          if (user.codeChallengeAnswers[3]) {
            questions[2]++;
          }
          if (user.codeChallengeAnswers[4]) {
            questions[3]++;
          }
          if (user.codeChallengeAnswers[5]) {
            questions[4]++;
          }
          if (user.codeChallengeAnswers[6]) {
            questions[5]++;
          }
          if (user.codeChallengeAnswers[7]) {
            questions[6]++;
          }
        }


        // most missed code challenge question

        // most popular referral
      });
      //var answerMostOftenCorrect = Math.max.apply(null, questions) + 1;
      var answerMostOftenCorrect = Math.max(...questions) + 1;

      //console.log(users);
      res.status(200).json({
        status: 'ok',
        data: {
          numInProgress: numInProgress,
          numAtChallenge: numAtChallenge,
          numAtInterview: numAtInterview,
          answerMostOftenCorrect: answerMostOftenCorrect
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).json({ status: 'fail', message: err });
    });
});


// function to handle authentication
function authRequired(req, res, next) {
  // assign token variable
  var token = req.body.token;
  User.findOne(
    //check if token exists and hasn't expired
    { authenticationTokens: { $elemMatch: { token: token, expiration: { $gt: Date.now() } } } })
    .then(function(user) {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ status: 'fail', message: 'Session expired. Please sign in again.' });
      }
      return null;
    })
    .catch(function(err) {
      //if there was an error finding the user by authenticationToken
      res.status(400).json({ status: 'fail', message: err.errors });
    });
}

app.listen(8000, function() {
  console.log('Listening on port 8000');
});
