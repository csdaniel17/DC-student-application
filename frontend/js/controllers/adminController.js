// controller for admin page
app.controller('AdminController', function($scope, $cookies, $rootScope, $location, $http, backend) {

  var token = $cookies.get('token');
  backend.isAdmin(token)
    .then(function(response) {
      return $http.post(API + '/adminData');
    })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(err) {
      $location.path($rootScope.fromPage);
    });

});
