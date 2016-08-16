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

  $scope.filter = {
    applicationCompleted: false,
    codeChallengeCompleted: false,
    interviewScheduled: false
  };
  $scope.filterResults = function(user) {
    console.log('filter is: ', $scope.filter);

    if (!$scope.filter.applicationCompleted && !$scope.filter.codeChallengeCompleted && !$scope.filter.interviewScheduled) {
      return true;
    }
    else if ($scope.filter.applicationCompleted && user.applicationCompleted) {
      displayUser = true;
    } else if ($scope.filter.codeChallengeCompleted && user.codeChallengeCompleted) {
      displayUser = true;
    } else if ($scope.filter.interviewScheduled && user.interviewScheduled) {
      displayUser = true;
    } else {
      displayUser = false;
    }

    return displayUser;
  };

  function noFilter(filterObj) {
    return Object.
      keys(filterObj).
      every(function (key) { return !filterObj[key]; });
  }

  $scope.sortType = 'applicationCompleted';
  $scope.sortReverse = false;
});
