app.controller('Page2Controller', function($scope, User, $location, Upload, $timeout, $http, backend, $cookies, $filter) {

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
