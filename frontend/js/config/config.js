// configure routes
app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'html/login.html',
      controller: 'LoginController'
    })
    .when('/page2', {
      templateUrl: 'html/2.html',
      controller: 'Page2Controller'
    })
    .when('/page3', {
      templateUrl: 'html/3.html',
      controller: 'MainController'
    })
    .when('/page4', {
      templateUrl: 'html/4.html',
      controller: 'MainController'
    })
    .when('/signup', {
      templateUrl: 'html/signup.html',
      controller: 'SignupController'
    })
    .when('/complete', {
      templateUrl: 'html/complete.html',
      controller: 'CompleteController'
    })
    .when('/reset', {
      templateUrl: 'html/reset.html',
      controller: 'ResetController'
    })
    .when('/change', {
      templateUrl: 'html/changepassword.html',
      controller: 'ChangeController'
    })
    .when('/codechallenge', {
      templateUrl: 'html/codechallenge.html',
      controller: 'CodeController'
    })
    .when('/schedule', {
      templateUrl: 'html/schedule.html',
      controller: 'ScheduleController'
    })
    .when('/finish', {
      templateUrl: 'html/finish.html'
    })
    .when('/admin', {
      templateUrl: 'html/admin.html',
      controller: 'AdminController'
    })
    .otherwise({redirectTo: '/'});
});
