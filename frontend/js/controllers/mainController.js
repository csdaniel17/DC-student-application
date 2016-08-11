// main controller
app.controller('MainController', function($scope, $rootScope, User, $location, Upload, $timeout, $http, backend, $cookies, $filter) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;

    //if application completed, redirect
    if (data.applicationCompleted) {
      $location.path('/complete');
    } else if ($rootScope.currentPage === 'page3' && data.pageLastCompleted !== 2) {
      $location.path('/page2');
    } else if ($rootScope.currentPage === 'page4' && data.pageLastCompleted !== 3) {
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
