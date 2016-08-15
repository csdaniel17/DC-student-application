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
      // $scope.series = ['Series A', 'Series B'];
      $scope.data = [adminData.numInProgress, adminData.numAtChallenge, adminData.numAtInterview, adminData.numScheduled];
      // $scope.onClick = function (points, evt) {
      //   console.log(points, evt);
      // };
      // $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
      // $scope.options = {
      //   scales: {
      //     yAxes: [
      //       {
      //         id: 'y-axis-1',
      //         type: 'linear',
      //         display: true,
      //         position: 'left'
      //       },
      //       {
      //         id: 'y-axis-2',
      //         type: 'linear',
      //         display: true,
      //         position: 'right'
      //       }
      //     ]
      //   }
      // };
    })
    .catch(function(err) {
      $location.path($rootScope.fromPage);
    });

});
