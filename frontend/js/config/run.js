app.run(function($rootScope, $location, $cookies, backend) {

  // on every location change start, see where the user is attempting to go
  $rootScope.$on('$locationChangeStart', function(event, nextUrl, currentUrl) {

    // get path user is going to from url
    var parts = nextUrl.split('/');
    var path = parts[parts.length-1];
    $rootScope.currentPage = path;

    // get path user is coming from
    var fromParts = currentUrl.split('/');
    var fromPath = fromParts[fromParts.length-1];
    $rootScope.fromPage = fromPath;

    // if user is going to a restricted area and doesn't have a token stored in a cookie, redirect to the login page
    var token = $cookies.get('token');

    if (path === 'page2' ||
        path === 'page3' ||
        path === 'page4' ||
        path === 'complete' ||
        path === 'schedule' ||
        path === 'codechallenge') {
      // is the token still valid?
      if (token) {
        backend.isTokenExpired(token)
          .then(function(response) {
            //do nothing, token is valid
          })
          .catch(function(err) {
            $rootScope.logout();
          });
      } else {
        $location.path('/');
      }
    }

    // is the user logged in? used to display login, logout and signup links
    $rootScope.isLoggedIn = function() {
      return $cookies.get('token');
    };

    $rootScope.logout = function() {
      $cookies.remove('token');
      backend.deleteToken(token)
        .then(function(response) {
          // do nothing
        })
        .catch(function(err) {
          console.log(err);
        });
      $location.path('/');
    };

    $rootScope.login = function() {
      $location.path('/');
    };

    $rootScope.signup = function() {
      $location.path('/signup');
    };

  });
});
