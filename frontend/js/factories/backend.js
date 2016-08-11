// saves user answers to the mongodb database
app.factory('backend', function($http) {
  return {
    sendData: function(data) {
      return $http({
        method: 'POST',
        url: API + '/save',
        data: data
      });
    },
    getData: function(token) {
      return $http({
        method: 'POST',
        url: API + '/getdata',
        data: { token: token }
      });
    },
    getAppOptions: function() {
      return $http({
        method: 'POST',
        url: API + '/getAppOptions'
      });
    },
    deleteToken: function(token) {
      return $http({
        method: 'POST',
        url: API + '/deleteToken',
        data: { token: token }
      });
    },
    isTokenExpired: function(token) {
      return $http({
        method: 'POST',
        url: API + '/isTokenExpired',
        data: { token: token }
      });
    },
    isAdmin: function(token) {
      return $http({
        method: 'POST',
        url: API + '/admin',
        data: { token: token }
      });
    }
  };
});
