var app = angular.module('DigitalCrafts', ['ngRoute', 'ngFileUpload', 'ngCookies', 'ui.ace']);

// backend running on port 8000
var API = "http://localhost:8000";

// configure routes
app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'html/login.html',
      controller: 'LoginController'
    })
    .when('/page2', {
      templateUrl: 'html/2.html',
      controller: 'Page2Controller'
    })
    .when('/page3', {
      templateUrl: 'html/3.html',
      controller: 'MainController'
    })
    .when('/page4', {
      templateUrl: 'html/4.html',
      controller: 'MainController'
    })
    .when('/signup', {
      templateUrl: 'html/signup.html',
      controller: 'SignupController'
    })
    .when('/complete', {
      templateUrl: 'html/complete.html',
      controller: 'CompleteController'
    })
    .when('/reset', {
      templateUrl: 'html/reset.html',
      controller: 'ResetController'
    })
    .when('/change', {
      templateUrl: 'html/changepassword.html',
      controller: 'ChangeController'
    })
    .when('/codechallenge', {
      templateUrl: 'html/codechallenge.html',
      controller: 'CodeController'
    })
    .when('/schedule', {
      templateUrl: 'html/schedule.html',
      controller: 'ScheduleController'
    })
    .when('/finish', {
      templateUrl: 'html/finish.html'
    })
    .otherwise({redirectTo: '/'});
});

app.run(function($rootScope, $location, $cookies, backend) {
  // on every location change start, see where the user is attempting to go
  $rootScope.$on('$locationChangeStart', function(event, nextUrl, currentUrl) {
    // get path from url
    // var path = nextUrl.split('/')[5];
    var parts = nextUrl.split('/');
    var path = parts[parts.length-1];
    $rootScope.currentPage = path;

    // if user is going to a restricted area and doesn't have a token stored in a cookie, redirect to the login page
    var token = $cookies.get('token');

    if (path === 'page2' ||
        path === 'page3' ||
        path === 'page4' ||
        path === 'complete' ||
        path === 'schedule' ||
        path === 'codechallenge') {
      // is the token still valid?
      if (token) {
        backend.isTokenExpired(token)
          .then(function(response) {
            //do nothing, token is valid
          })
          .catch(function(err) {
            $rootScope.logout();
          });
      } else {
        $location.path('/');
      }
    }

    // is the user logged in? used to display login, logout and signup links
    $rootScope.isLoggedIn = function() {
      return $cookies.get('token');
    };

    $rootScope.logout = function() {
      $cookies.remove('token');
      backend.deleteToken(token)
        .then(function(response) {
          // do nothing
        })
        .catch(function(err) {
          console.log(err);
        });
      $location.path('/');
    };

    $rootScope.login = function() {
      $location.path('/');
    };

    $rootScope.signup = function() {
      $location.path('/signup');
    };

  });
});

// login controller
app.controller('LoginController', function($scope, $http, $location, $rootScope, $cookies, backend) {

  // login page is being loaded. is the user already logged in? If so, redirect
  if ($cookies.get('token')) {
    $location.path('/page2');
  }

  $scope.login = function() {
    $http.post(API + '/login', { email: $scope.email, password: $scope.password })
      .then(function(response) {
        // if login is a success, redirect
        if (response.status === 200) {
          $scope.loginFailed = false;
          // set a cookie with the token from the database response
          $cookies.put('token', response.data.token);
          // redirect to beginning of application
          $location.path('/page2');
        } else if (response.status === 201) {
          $location.path('/change');
        }
      })
      .catch(function(err) {
        // tell user login wasn't successful
        $scope.loginFailed = true;
      });
  };

  $scope.registration = function(){
    $location.path("/signup");
  };

  $scope.forgotPassword = function() {
    $location.path("/reset");
  };

});

// reset password controller
app.controller('ResetController', function($scope, $http) {

  $scope.resetPassword = function() {
    var userEmail = $scope.email;

    $http.post(API + '/resetPassword', { email: userEmail })
      .then(function(response) {
        $scope.checkEmail = true;
        console.log(response);
      })
      .catch(function(err) {
        if (err.status === 400) {
          $scope.userNotFound = true;
        }
        console.log(err);
      });

  };

});

// change password controller
app.controller('ChangeController', function($scope, $http, $location) {

  $scope.changePassword = function() {
    var userEmail = $scope.email;
    var newPassword = $scope.password;

    $http.post(API + '/changepassword', { email: userEmail, password: newPassword })
      .then(function(response) {
        if (response.status === 200) {
          $location.path('/');
        }
        console.log(response);
      })
      .catch(function(err) {
        if (err.status === 400) {
          $scope.userNotFound = true;
        }
        console.log(err);
      });
  };

});

// signup controller
app.controller('SignupController', function($scope, $location, $http, $timeout, $cookies) {
  $scope.signUp = function() {
    $http.post(API + '/signup', { email: $scope.email, password: $scope.password })
      .then(function(response) {
        if (response.status === 200) {
          // user successfully created
          $scope.registered = true;
          $timeout(function() {
            $scope.loginFailed = false;
            // set a cookie with the token from the database response
            $cookies.put('token', response.data.token);
            // redirect to beginning of application
            $location.path('/page2');
            // $location.path('/');
          }, 3000);
        }
      })
      .catch(function(err) {
        $scope.emailTaken = true;
        console.log(err);
      });
  };
});

app.controller('Page2Controller', function($scope, User, $location, Upload, $timeout, $http, backend, $cookies, $filter) {

  // var cityDates;
  // Get value of city radio button
  // $scope.$watch('city', function(value){
  //   console.log(value);
  // });

  // load question answers from database
  backend.getAppOptions().then(function(options) {

    // load answers/options for "How did you hear about DigitalCrafts?"
    howDidYouHear = [];
    var optionsList = options.data.message.how_did_you_hear;
    angular.forEach(optionsList, function(option) {
      howDidYouHear.push({ name: option });
    });
    $scope.options = howDidYouHear;

    // load options for cohort location
    $scope.cityCohorts = options.data.message.cohort_locations;

    // load options for cohort dates
    // update code to be more flexible for multiple cities
    $scope.atlantaDates = options.data.message.atlanta_dates;
    $scope.houstonDates = options.data.message.houston_dates;
  });

  // load data from backend
  var userToken = $cookies.get('token');
  if (userToken) {
    backend.getData(userToken).then(function(userData) {
      var data = userData.data.message;

      //if application completed, redirect
      if (data.applicationCompleted) {
        $location.path('/complete');
      }

      $scope.firstname = data.firstname;
      $scope.lastname = data.lastname;
      $scope.phone = data.phone;
      $scope.address = data.address;
      $scope.city = data.city;
      $scope.cohort = data.cohort;
      $scope.relocating = data.relocating;
      var date = data.birthday;
      $scope.birthday = $filter('date')(date, 'MM/dd/yyyy');

      // show previously selected "How did you hear about us" options:
      angular.forEach($scope.options, function(option) {
        if (data.howDidYouHear.indexOf(option.name) > -1) {
          option.selected = true;
        }
      });

    });
  }


  // saving data
  $scope.page2 = function(redirect) {

    var optionsSelected = [];
    angular.forEach($scope.options, function(option) {
      if (option.selected) {
        optionsSelected.push(option.name);
      }
    });

    var theData = User.getData();
    theData.firstname = $scope.firstname;
    theData.lastname = $scope.lastname;
    theData.phone = $scope.phone;
    theData.birthday = $scope.birthday;
    theData.address = $scope.address;
    theData.city = $scope.city;
    theData.cohort = $scope.cohort;
    theData.relocating = $scope.relocating;
    theData.token = $cookies.get('token');
    theData.optionsSelected = optionsSelected;
    theData.page = 2;
    User.saveData(theData);
    backend.sendData(theData);

    if (redirect === 'stay') {
      $scope.saved = true;
      $timeout(function() {
        $scope.saved = false;
      }, 3000);
      return true;
    }

    $location.path('/page3');
  };

});


// main controller
app.controller('MainController', function($scope, $rootScope, User, $location, Upload, $timeout, $http, backend, $cookies, $filter) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;

    //if application completed, redirect
    if (data.applicationCompleted) {
      $location.path('/complete');
    } else if ($rootScope.currentPage === 3 && data.pageLastCompleted !== 2) {
      $location.path('/page2');
    } else if ($rootScope.currentPage === 4 && data.pageLastCompleted !== 3) {
      $location.path('/page3');
    }

    $scope.firstname = data.firstname;
    $scope.lastname = data.lastname;
    $scope.phone = data.phone;
    $scope.address = data.address;
    $scope.city = data.city;
    $scope.cohort = data.cohort;
    $scope.relocating = data.relocating;
    $scope.education = data.education;
    $scope.employment = data.employment;
    $scope.loan = data.loan;
    $scope.programming = data.programming;
    $scope.interest = data.interest;
    $scope.plan = data.plan;
    $scope.why = data.why;
    $scope.github = data.github;
    $scope.linkedin = data.linkedin;
    $scope.portfolio = data.portfolio;
    var date = data.birthday;
    $scope.birthday = $filter('date')(date, 'MM/dd/yyyy');
  });

  $scope.page3 = function(redirect) {
     var theData = User.getData();
     theData.education = $scope.education;
     theData.employment = $scope.employment;
     theData.loan = $scope.loan;
     theData.programming = $scope.programming;
     theData.interest = $scope.interest;
     theData.plan = $scope.plan;
     theData.why = $scope.why;
     theData.page = 3;

     User.saveData(theData);
     backend.sendData(theData);

     if (redirect === 'stay') {
       $scope.saved = true;
       $timeout(function() {
         $scope.saved = false;
       }, 3000);
       return true;
     }
    $location.path('/page4');
  };

  $scope.page4 = function(redirect) {
    if ($scope.file) {
      $scope.upload($scope.file);
    }

    var theData = User.getData();
    theData.github = $scope.github;
    theData.linkedin = $scope.linkedin;
    theData.portfolio = $scope.portfolio;
    theData.understand = $scope.understand;
    theData.effortagree = $scope.effortagree;
    theData.page = 4;

    User.saveData(theData);
    backend.sendData(theData);

    if (redirect === 'stay') {
      $scope.saved = true;
      $timeout(function() {
        $scope.saved = false;
      }, 3000);
      return true;
    }
    $location.path('/complete');
  };


 // upload on file select or drop
 $scope.upload = function (file) {
     Upload.upload({
         url: API + '/upload',
         data: {file: file, 'token': $cookies.get('token')}
     }).then(function (resp) {
         console.log('Success uploaded. Response: ' + resp.data);
     }, function (resp) {
         console.log('Error status: ' + resp.status);
     }, function (evt) {
         //do nothin
     });
 };
});


// controller for when application is complete/submitted
app.controller('CompleteController', function($cookies, $http, $scope, $location, backend) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;

    // if Code Challenge completed, redirect
    if (data.codeChallengeCompleted) {
      $location.path('/schedule');
    } else if (data.pageLastCompleted !== 4) {
      $location.path('/page2');
    }

    // if the user ended back on the complete page after an email
    // has already been sent, don't send the email again
    if (!data.applicationCompleted) {
      // call backend to send the email
      $http.post(API + '/complete', { data: userToken })
        .then(function(response) {
          console.log(response);
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  });

  $scope.codeChallenge = function() {
    $location.path('/codechallenge');
  };

});

/*
  CODE CHALLENGE
*/

app.controller('CodeController', function($scope, $http, $timeout, $cookies, $location, backend) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;
    if (!data.applicationCompleted) {
      $location.path('/page2');
    }
  });

  // reroute console messages to the 'result-log' div
  console.log = (function (old_function, div_log) {
      return function (text) {
          old_function(text);
          div_log.innerText += '> ' + text + '\n';
      };
  } (console.log.bind(console), document.getElementById("result-log")));


  $scope.clearConsole = function() {
    document.getElementById("result-log").innerText = '';
  };

  $scope.aceLoaded = function(_editor) {
    _editor.$blockScrolling = Infinity;

    //set content of editor:
    var initialCode = `
//////////////////////////////////////////////////////////////////
///////////////DIGITALCRAFTS ADMISSIONS CHALLENGE/////////////////
//////////////////////////////////////////////////////////////////
// INSTRUCTIONS:
// - Code is to be written in JavaScript only. You don't need HTML or CSS.
// - Please write the code for each question directly below the question itself.
// - Hit Run at the bottom of the editor to test your code and execute any functions you've called.
// - Press "Save & Continue" when finished.
// - For this challenge, consider the words "argument" and "parameter" to be interchangable.
// - All variables and methods are persistent from question to question, so there is no need to redeclare anything!
// - PLEASE NOTE: You should also take a screenshot of your work (or copy it elsewhere) just in case!!
// - Please use Chrome!

//////////////////////////PLEASE READ INSTRUCTIONS VERY CAREFULLY!//////////////////////////

// 1) Declare two variables, a string and an integer named "fullName" and "age". Set them equal to your name and age.




// 2) Declare an empty array called "myArray".
// Add the variables from #1 (fullName and age) to the empty array using the push method.
// Print to the console.




// 3) Write a simple function that takes no parameters called "sayHello".
// Make it print "Hello!" to the console when called.
// Call the function.




// 4) Declare a variable named splitName and set it equal to
// fullName split into two seperate objects in an array.
// (In other words, if the variable fullName is equal to "John Smith", then splitName should
// equal ["John", "Smith"].)
// Print splitName to the console.
// HINT: Remember to research the methods and concepts listed in the instructions PDF.




// 5) Write another simple function that takes no parameters called "sayName".
// When called, this function should print "Hello, ____!" to the console, where the blank is
// equal to the first value in the splitName array from #4.
// Call the function.  (In our example, "Hello, John!" would be printed to the console.)




// 6) Write another function named myAge.  This function should take one parameter: the year you
// were born, and it should print the implied age to the console.
// Call the function, passing the year you were born as the argument/parameter.
// HINT: http://www.w3schools.com/js/js_functions.asp




// 7) Using the basic function given below, add code so that sum_odd_numbers will print to the console the sum of all the odd numbers from 1 to 5000.  Don't forget to call the function!
// HINT: Consider using a 'for loop'.

function sum_odd_numbers() {
    var sum = 0;

    // Write your code here



    console.log(sum);
}





//////////////////////////////////////////////////////////////////
/////////////////////////////THE END!/////////////////////////////
//////////////////////////////////////////////////////////////////
    `;

    $scope.code = initialCode;

    $scope.runCode = function() {
      var code = _editor.getValue();

      // replace console.*, alerts, and such with postMessage so that webWorker can communicate back
      code = code.replace(/console.log|console.dir|console.error|alert|window.alert|document.write/g, "postMessage");

      // run client side code in a web worker
      var webWorker;
      var blob;
      var numMessagesReceived = 0;

      if (typeof(Worker) !== "undefined") { // does the browser support web workers?

        if (typeof(webWorker) == "undefined") { //does webWorker already exist?
          blob = new Blob([code], {type: 'application/javascript'});
          webWorker = new Worker(URL.createObjectURL(blob));
        }

        // print console.log from the user's code to our console
        webWorker.onmessage = function(event) {
          numMessagesReceived++;
          if (numMessagesReceived > 100) {
            console.log('Possible stack overflow or infinite loop detected. Terminating.');
            webWorker.terminate();
            webWorker = undefined;
          }
          $timeout(function() {
            console.log(JSON.stringify(event.data));
          }, 100);
        };

        // print any errors that may occur
        webWorker.onerror = function(event) {
          console.log(event.message);
        };

        // terminate webWorker
        $timeout(function() {
          if (typeof(webWorker) !== "undefined") {
            webWorker.terminate();
            webWorker = undefined;
          }
        }, 3000);


      } else {
        // unless they're using Opera, this shouldn't occur
        console.log("Sorry, no web worker support");
      }
      //eval(code);

    };



    $scope.saveCode = function() {
      var code = _editor.getValue();

      var token = $cookies.get('token');

      $http.post(API + '/testCodeChallenge', { code: code, token: token })
        .then(function(response) {
          //success
          $location.path('/schedule');
        })
        .catch(function(err) {
          if (err) {
            console.log('There was an error testing the code challenge: ', err);
          }
        });
    };

  }; // end aceLoaded



});

app.controller('ScheduleController', function($scope, $http, $cookies, $location, $timeout, $rootScope) {

  var userToken = $cookies.get('token');

  $scope.interviewScheduled = function() {

    $http.post(API + '/interviewScheduled', { token: userToken, intScheduled: true })
      .then(function(response) {
        if (response.status === 200) {
          $location.path('/finish');
        }
      })
      .catch(function(err) {
        // show an error and have the user retry
        $scope.loginExpired = true;
        $timeout(function() {
          $rootScope.logout();
        }, 3000);
      });
  };

});


// saves user answers to the mongodb database
app.factory('backend', function($http) {
  return {
    sendData: function(data) {
      return $http({
        method: 'POST',
        url: API + '/save',
        data: data
      });
    },
    getData: function(token) {
      return $http({
        method: 'POST',
        url: API + '/getdata',
        data: { token: token }
      });
    },
    getAppOptions: function() {
      return $http({
        method: 'POST',
        url: API + '/getAppOptions'
      });
    },
    deleteToken: function(token) {
      return $http({
        method: 'POST',
        url: API + '/deleteToken',
        data: { token: token }
      });
    },
    isTokenExpired: function(token) {
      return $http({
        method: 'POST',
        url: API + '/isTokenExpired',
        data: { token: token }
      });
    }
  };
});

// service to store user answers throughout application process
app.service('User', function() {
  this.userAnswers = {};
  this.saveData = function(data) {
    this.userAnswers = data;
  };
  this.getData = function() {
    return this.userAnswers;
  };
});
