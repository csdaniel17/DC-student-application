var passed = [];
var failed = [];

var myReporter = {
  specDone: function(result) {

    // push to appropriate array
    if (result.status === 'passed') {
      passed.push(result.id);
    } else {
      failed.push(result.id);
    }
    // console.log('result in specDone: ', result);
    // console.log('Spec: ' + result.description + ' was ' + result.status);
    // for(var i = 0; i < result.failedExpectations.length; i++) {
    //
    //   console.log('Failure: ' + result.failedExpectations[i].message);
    //   console.log(result.failedExpectations[i].stack);
    // }
    //
    //
    // console.log(result.passedExpectations.length);
  },



  suiteDone: function(result) {

    var data = {
      passed: passed,
      failed: failed
    };
    console.log('data is: ', data);
    parent.postMessage(data, "*");

    // console.log('Suite: ' + result.description + ' was ' + result.status);
    // console.log("length is: ", result.failedExpectations.length);
    // console.log('result is', result);
    // for(var i = 0; i < result.failedExpectations.length; i++) {
    //
    //   console.log('AfterAll ' + result.failedExpectations[i].message);
    //   console.log(result.failedExpectations[i].stack);
    // }
  },


  jasmineDone: function() {
    //console.log('Finished suite');
  }
};

jasmine.getEnv().addReporter(myReporter);
