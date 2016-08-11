/*
  CODE CHALLENGE
*/

app.controller('CodeController', function($scope, $http, $timeout, $cookies, $location, backend) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;
    if (!data.applicationCompleted) {
      $location.path('/page2');
    }
  });

  // reroute console messages to the 'result-log' div
  console.log = (function (old_function, div_log) {
      return function (text) {
          old_function(text);
          div_log.innerText += '> ' + text + '\n';
      };
  } (console.log.bind(console), document.getElementById("result-log")));


  $scope.clearConsole = function() {
    document.getElementById("result-log").innerText = '';
  };

  $scope.aceLoaded = function(_editor) {
    _editor.$blockScrolling = Infinity;

    //set content of editor:
    var initialCode = `
//////////////////////////////////////////////////////////////////
///////////////DIGITALCRAFTS ADMISSIONS CHALLENGE/////////////////
//////////////////////////////////////////////////////////////////
// INSTRUCTIONS:
// - Code is to be written in JavaScript only. You don't need HTML or CSS.
// - Please write the code for each question directly below the question itself.
// - Hit Run at the bottom of the editor to test your code and execute any functions you've called.
// - Press "Save & Continue" when finished.
// - For this challenge, consider the words "argument" and "parameter" to be interchangable.
// - All variables and methods are persistent from question to question, so there is no need to redeclare anything!
// - PLEASE NOTE: You should also take a screenshot of your work (or copy it elsewhere) just in case!!
// - Please use Chrome!

//////////////////////////PLEASE READ INSTRUCTIONS VERY CAREFULLY!//////////////////////////

// 1) Declare two variables, a string and an integer named "fullName" and "age". Set them equal to your name and age.




// 2) Declare an empty array called "myArray".
// Add the variables from #1 (fullName and age) to the empty array using the push method.
// Print to the console.




// 3) Write a simple function that takes no parameters called "sayHello".
// Make it print "Hello!" to the console when called.
// Call the function.




// 4) Declare a variable named splitName and set it equal to
// fullName split into two seperate objects in an array.
// (In other words, if the variable fullName is equal to "John Smith", then splitName should
// equal ["John", "Smith"].)
// Print splitName to the console.
// HINT: Remember to research the methods and concepts listed in the instructions PDF.




// 5) Write another simple function that takes no parameters called "sayName".
// When called, this function should print "Hello, ____!" to the console, where the blank is
// equal to the first value in the splitName array from #4.
// Call the function.  (In our example, "Hello, John!" would be printed to the console.)




// 6) Write another function named myAge.  This function should take one parameter: the year you
// were born, and it should print the implied age to the console.
// Call the function, passing the year you were born as the argument/parameter.
// HINT: http://www.w3schools.com/js/js_functions.asp




// 7) Using the basic function given below, add code so that sum_odd_numbers will print to the console the sum of all the odd numbers from 1 to 5000.  Don't forget to call the function!
// HINT: Consider using a 'for loop'.

function sum_odd_numbers() {
    var sum = 0;

    // Write your code here



    console.log(sum);
}





//////////////////////////////////////////////////////////////////
/////////////////////////////THE END!/////////////////////////////
//////////////////////////////////////////////////////////////////
    `;

    $scope.code = initialCode;

    $scope.runCode = function() {
      var code = _editor.getValue();

      // replace console.*, alerts, and such with postMessage so that webWorker can communicate back
      code = code.replace(/console.log|console.dir|console.error|alert|window.alert|document.write/g, "postMessage");

      // run client side code in a web worker
      var webWorker;
      var blob;
      var numMessagesReceived = 0;

      if (typeof(Worker) !== "undefined") { // does the browser support web workers?

        if (typeof(webWorker) == "undefined") { //does webWorker already exist?
          blob = new Blob([code], {type: 'application/javascript'});
          webWorker = new Worker(URL.createObjectURL(blob));
        }

        // print console.log from the user's code to our console
        webWorker.onmessage = function(event) {
          numMessagesReceived++;
          if (numMessagesReceived > 100) {
            console.log('Possible stack overflow or infinite loop detected. Terminating.');
            webWorker.terminate();
            webWorker = undefined;
          }
          $timeout(function() {
            console.log(JSON.stringify(event.data));
          }, 100);
        };

        // print any errors that may occur
        webWorker.onerror = function(event) {
          console.log(event.message);
        };

        // terminate webWorker
        $timeout(function() {
          if (typeof(webWorker) !== "undefined") {
            webWorker.terminate();
            webWorker = undefined;
          }
        }, 3000);


      } else {
        // unless they're using Opera, this shouldn't occur
        console.log("Sorry, no web worker support");
      }
      //eval(code);

    };



    $scope.saveCode = function() {
      var code = _editor.getValue();

      var token = $cookies.get('token');

      $http.post(API + '/testCodeChallenge', { code: code, token: token })
        .then(function(response) {
          //success
          $location.path('/schedule');
        })
        .catch(function(err) {
          if (err) {
            console.log('There was an error testing the code challenge: ', err);
          }
        });
    };

  }; // end aceLoaded



});
