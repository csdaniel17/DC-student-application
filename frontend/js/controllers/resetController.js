// reset password controller
app.controller('ResetController', function($scope, $http) {

  $scope.resetPassword = function() {
    var userEmail = $scope.email;

    $http.post(API + '/resetPassword', { email: userEmail })
      .then(function(response) {
        $scope.checkEmail = true;
      })
      .catch(function(err) {
        if (err.status === 400) {
          $scope.userNotFound = true;
        }
      });

  };

});
