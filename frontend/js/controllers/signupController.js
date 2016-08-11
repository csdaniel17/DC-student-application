// signup controller
app.controller('SignupController', function($scope, $location, $http, $timeout, $cookies) {
  $scope.signUp = function() {
    $http.post(API + '/signup', { email: $scope.email, password: $scope.password })
      .then(function(response) {
        if (response.status === 200) {
          // user successfully created
          $scope.registered = true;
          $timeout(function() {
            $scope.loginFailed = false;
            // set a cookie with the token from the database response
            $cookies.put('token', response.data.token);
            // redirect to beginning of application
            $location.path('/page2');
            // $location.path('/');
          }, 3000);
        }
      })
      .catch(function(err) {
        $scope.emailTaken = true;
        console.log(err);
      });
  };
});
