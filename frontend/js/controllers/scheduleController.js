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
