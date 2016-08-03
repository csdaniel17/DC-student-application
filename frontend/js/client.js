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
      controller: 'MainController'
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
app.controller('LoginController', function($scope, $http, $location, $rootScope, $cookies) {
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

// main controller
app.controller('MainController', function($scope, User, $location, Upload, $timeout, $http, backend, $cookies) {


  $scope.page2 = function() {
    var theData = User.getData();
    console.log('theData is: ', theData);
    theData.firstname = $scope.firstname;
    theData.lastname = $scope.lastname;
    theData.phone = $scope.phone;
    theData.birthday = $scope.birthday;
    theData.address = $scope.address;
    theData.city = $scope.city;
    theData.cohort = $scope.cohort;
    theData.relocating = $scope.relocating;
    theData.token = $cookies.get('token');
    theData.page = 2;
    console.log('theData is: ', theData);
    User.saveData(theData);
    backend.sendData(theData);
    $location.path('/page3');
  };

  $scope.page3 = function() {
     var theData = User.getData();
     console.log('before: ', theData);
     theData.education = $scope.education;
     theData.employment = $scope.employment;
     theData.loan = $scope.loan;
     theData.programming = $scope.programming;
     theData.interest = $scope.interest;
     theData.plan = $scope.plan;
     theData.why = $scope.why;
     theData.page = 3;
     console.log('after: ', theData);
     User.saveData(theData);
     backend.sendData(theData);
    $location.path('/page4');
  };

  $scope.page4 = function() {
    if ($scope.file) {
      $scope.upload($scope.file);
      console.log($scope.file);
    }

    var theData = User.getData();
    console.log('before: ', theData);
    theData.github = $scope.github;
    theData.linkedin = $scope.linkedin;
    theData.portfolio = $scope.portfolio;
    theData.understand = $scope.understand;
    theData.effortagree = $scope.effortagree;
    User.saveData(theData);
    backend.sendData(theData);
    console.log('after: ', theData);
  };


 // upload on file select or drop
 $scope.upload = function (file) {
     Upload.upload({
         url: 'http://localhost:8000/upload',
         data: {file: file}
        //  data: file
     }).then(function (resp) {
         console.log('Success uploaded. Response: ' + resp.data);
     }, function (resp) {
         console.log('Error status: ' + resp.status);
     }, function (evt) {
         //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
         //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
         console.log('progress:...');
     });
 };
});

// saves user answers to the mongodb database
app.factory('backend', function($http) {
  return {
    sendData: function(data) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/save',
        data: data
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
