var results = [];

var myReporter = {
  specDone: function(result) {

    // push to  array
    results.push({id: result.id, desc: result.description, status: result.status});


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

    //console.log('data is: ', results);
    parent.postMessage(results, "*");

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
