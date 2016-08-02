var app = angular.module('DigitalCrafts', ['ngRoute']);

// configure routes
app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'html/1.html',
      controller: 'MainController'
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
    .otherwise({redirectTo: '/'});
});

// main controller
app.controller('MainController', function($scope, User, $location) {

  $scope.page1 = function() {
    User.saveData({ email: $scope.email });
    $location.path('/page2');
  };

});

// service to store user answers throughout application process
app.service('User', function() {
  var userAnswers = {};
  this.saveData = function(data) {
    this.userAnswers = data;
  };
  this.getData = function() {
    return this.userAnswers;
  };
});
