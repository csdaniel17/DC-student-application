// controller for when application is complete/submitted
app.controller('CompleteController', function($cookies, $http, $scope, $location, backend) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;

    // if Code Challenge completed, redirect
    if (data.codeChallengeCompleted) {
      $location.path('/schedule');
    } else if (data.pageLastCompleted !== 4) {
      $location.path('/page2');
    }

    // if the user ended back on the complete page after an email
    // has already been sent, don't send the email again
    if (!data.applicationCompleted && data.pageLastCompleted === 4) {
      // call backend to send the email
      $http.post(API + '/complete', { data: userToken })
        .then(function(response) {

        })
        .catch(function(err) {
          console.log(err);
        });
    }
  });

  $scope.codeChallenge = function() {
    $location.path('/codechallenge');
  };

});
