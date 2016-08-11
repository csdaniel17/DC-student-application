// change password controller
app.controller('ChangeController', function($scope, $http, $location) {

  $scope.changePassword = function() {
    var userEmail = $scope.email;
    var newPassword = $scope.password;

    $http.post(API + '/changepassword', { email: userEmail, password: newPassword })
      .then(function(response) {
        if (response.status === 200) {
          $location.path('/');
        }
        console.log(response);
      })
      .catch(function(err) {
        if (err.status === 400) {
          $scope.userNotFound = true;
        }
        console.log(err);
      });
  };

});
