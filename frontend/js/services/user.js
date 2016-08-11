// service to store user answers throughout application process
app.service('User', function() {
  this.userAnswers = {};
  this.saveData = function(data) {
    this.userAnswers = data;
  };
  this.getData = function() {
    return this.userAnswers;
  };
});
