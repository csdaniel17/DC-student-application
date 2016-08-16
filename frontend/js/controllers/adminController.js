// controller for admin page
app.controller('AdminController', function($scope, $cookies, $rootScope, $location, $http, backend) {

  var token = $cookies.get('token');
  backend.isAdmin(token)
    .then(function(response) {
      return $http.post(API + '/adminData');
    })
    .then(function(response) {
      $scope.users = response.data.data.users;
      var adminData = response.data.data;
      console.log(adminData);
      $scope.numInProgress = adminData.numInProgress;
      $scope.numAtChallenge = adminData.numAtChallenge;
      $scope.numAtInterview = adminData.numAtInterview;
      $scope.numScheduled = adminData.numScheduled;

      $scope.labels = ["App in progress", "At Challenge", "At Interview", "Finished"];
      $scope.data = [adminData.numInProgress, adminData.numAtChallenge, adminData.numAtInterview, adminData.numScheduled];

    })
    .catch(function(err) {
      if ($rootScope.fromPage !== 'admin') {
        $location.path($rootScope.fromPage);
      } else {
        $location.path('/');
      }
    });

  $scope.dateRangeFilter = function(startDate, endDate) {


    return function (item) {
      if (item.applicationCompletedDate === null) {
        return false;
      }
      if (new Date(item.applicationCompletedDate) >= new Date(startDate) &&
          new Date(item.applicationCompletedDate) <= new Date(endDate)) {
        return true;
      }
      return false;
    }
  }

  $scope.sortType = 'firstname';
  $scope.sortReverse = false;
});
