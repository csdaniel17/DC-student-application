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
    .otherwise({redirectTo: '/'});
});

app.run(function($rootScope, $location, $cookies) {
  // on every location change start, see where the user is attempting to go
  $rootScope.$on('$locationChangeStart', function(event, nextUrl, currentUrl) {
    // get path from url
    var path = nextUrl.split('/')[5]; // WILL NEED TO CHANGE AFTER DEV - [4];
    $rootScope.currentPage = path;

    // if user is going to a restricted area and doesn't have a token stored in a cookie, redirect to the login page
    var token = $cookies.get('token');
    if (!token && (path === 'page2' || path === 'page3' || path === 'page4')) {
      $location.path('/');
    }

    // is the user logged in? used to display login, logout and signup links
    $rootScope.isLoggedIn = function() {
      return $cookies.get('token');
    };

    $rootScope.logout = function() {
      $cookies.remove('token');
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
app.controller('SignupController', function($scope, $location, $http, $timeout) {
  $scope.signUp = function() {
    $http.post(API + '/signup', { email: $scope.email, password: $scope.password })
      .then(function(response) {
        if (response.status === 200) {
          // user successfully created
          $scope.registered = true;
          $timeout(function() {
            $location.path('/');
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
app.controller('MainController', function($scope, User, $location, Upload, $timeout, $http, backend, $cookies, $filter) {

  // load data from backend
  var userToken = $cookies.get('token');
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
app.controller('CompleteController', function($cookies, $http, $scope, $location) {

  // call backend to send the email
  var userToken = $cookies.get('token');
  $http.post(API + '/complete', { data: userToken })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(err) {
      console.log(err);
    });

  $scope.codeChallenge = function() {
    $location.path('/codechallenge');
  };
});

/*
  CODE CHALLENGE
*/

app.controller('CodeController', function($scope) {

  // reroute console messages to the 'result-log' div
  console.log = (function (old_function, div_log) {
      return function (text) {
          old_function(text);
          div_log.innerText += '> ' + text + '\n';
      };
  } (console.log.bind(console), document.getElementById("result-log")));

  // $scope.code = 'alert("Hello World")';

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
// - Please write the code for each question directly below the question itself.
// - Hit Run at the top of the page to test your code and execute any functions you've called.
// - Press "Save" when finished. Press "Share", copy the URL, and return it to hello@digitalcrafts.com.
// - For this challenge, consider the words "argument" and "parameter" to be interchangable.
// - All variables and methods are persistent from question to question, so there is no need to redeclare anything!
// - PLEASE NOTE: You should also take a screenshot of your work (or copy it elsewhere) just in case!!

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
    //_editor.setValue(initialCode);



    // Options
    //_editor.setReadOnly(true);
    $scope.getCode = function() {
     var code = _editor.getValue(); // or session.getValue

     /*
      call repl.it service

      API hostname: api.repl.it
      API port: 80 (will automatically connect on 443 for https websites)
      API Secret: l99niagk92hhytq8
     */
    //  var token = {"msg_mac":"Vk6b9PZK24+POYgHP4+MKHaT0vIIiSr++JMh3viG3Qw=","time_created":1470665174000};
    //  var repl = new ReplitClient('api.repl.it', '80', 'nodejs', token);
     //
    //  repl.evaluateOnce(
    //    code, {
    //    stdout: function(output) {
    //      // output from the _editor code
    //      console.log(output);
    //    }
    //  }).then(
    //    function success(result) {
    //      // The evaluation succeeded. Result will contain `data` or `error`
    //      // depending on whether the code compiled and ran or if there was an
    //      // error.
    //      if (result.error) {
    //        console.log('Error:', result.error);
    //      } else {
    //        console.log('Result', result.data);
    //        console.log('Entire Result', result);
    //      }
    //    },
    //    function error(error) {
    //      // There was an error connecting to the service :(
    //      console.error('Error connecting to repl.it', error);
    //    }
    //  );


     eval(code);
    };

  };

   $scope.aceChanged = function(e) {
     //
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
        data: {token: token}
      });
    },
    getAppOptions: function() {
      return $http({
        method: 'POST',
        url: API + '/getAppOptions'
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
