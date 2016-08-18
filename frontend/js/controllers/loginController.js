// login controller
app.controller('LoginController', function($scope, $http, $location, $rootScope, $cookies, backend) {

  // reset admin status at login
  $rootScope.userIsAdmin = undefined;

  // login page is being loaded. is the user already logged in? If so, redirect
  if ($cookies.get('token')) {
    $location.path('/page2');
  }

  $scope.login = function() {
    $http.post(API + '/login', { email: $scope.email, password: $scope.password })
      .then(function(response) {
        // if login is a success, redirect
        if (response.status === 200) {

          $scope.loginFailed = false;
          // set a cookie with the token from the database response
          $cookies.put('token', response.data.token);

          // if user is an admin, redirect to admin page2
          if (response.data.isAdmin) {
            $location.path('/admin');
          } else {
            // redirect to beginning of application
            $location.path('/page2');
          }

        } else if (response.status === 201) {
          $location.path('/change');
        }
      })
      .catch(function(err) {
        // tell user login wasn't successful
        $scope.loginFailed = true;
      });
  };

  $scope.registration = function(){
    $location.path("/signup");
  };

  $scope.forgotPassword = function() {
    $location.path("/reset");
  };

});
