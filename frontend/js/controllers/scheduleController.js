app.controller('ScheduleController', function($scope, $http, $cookies, $location, $timeout, $rootScope, backend) {

  var userToken = $cookies.get('token');

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;
    if (data.interviewScheduled) {
      $location.path('/finish');
    }
  });

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
