var app = angular.module('DigitalCrafts', ['ngRoute', 'ngFileUpload', 'ngCookies']);

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
      controller: 'MainController'
    })
    .when('/reset', {
      templateUrl: 'html/reset.html',
      controller: 'ResetController'
    })
    .when('/change', {
      templateUrl: 'html/changepassword.html',
      controller: 'ChangeController'
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
    if (!token && (path === 'page2' || path === 'plage3' || path === 'page4')) {
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
app.controller('ChangeController', function($scope) {

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

  // load "How did you hear about us?" options
  backend.getHowDidYouHear().then(function(options) {
    howDidYouHear = [];
    var optionsList = options.data.message.how_did_you_hear;
    angular.forEach(optionsList, function(option) {
      howDidYouHear.push({ name: option });
    });
    $scope.options = howDidYouHear;
  });

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;
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
    getHowDidYouHear: function() {
      return $http({
        method: 'POST',
        url: API + '/getHearOptions'
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
