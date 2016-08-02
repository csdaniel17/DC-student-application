var app = angular.module('DigitalCrafts', ['ngRoute', 'ngFileUpload']);

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
app.controller('MainController', function($scope, User, $location, Upload, $timeout, $http, backend) {

  $scope.page1 = function() {
    User.saveData({ email: $scope.email });
    var theData = User.getData();
    backend.saveData(theData);
    $location.path('/page2');
  };

  $scope.page2 = function() {
    var theData = User.getData();
    theData.firstname = $scope.firstname;
    theData.lastname = $scope.lastname;
    theData.phone = $scope.phone;
    theData.birthday = $scope.birthday;
    theData.address = $scope.address;
    theData.city = $scope.city;
    theData.cohort = $scope.cohort;
    theData.relocating = $scope.relocating;
    User.saveData(theData);
    backend.sendData(theData);
    $location.path('/page3');
  };

  $scope.page3 = function() {
    $location.path('/page4');
  };

  $scope.page4 = function() {
    //if ($scope.form.file.$valid && $scope.file) {
      $scope.upload($scope.file);
      console.log($scope.file);
    //}
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

app.factory('backend', function($http) {
  return{
    sendData: function(data) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/upload',
        data: data
      });
    }
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
