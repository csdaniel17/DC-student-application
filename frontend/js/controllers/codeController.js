/*
  CODE CHALLENGE
*/

app.controller('CodeController', function($scope, $http, $timeout, $cookies, $location, backend, $rootScope) {

  // load data from backend
  var userToken = $cookies.get('token');
  backend.getData(userToken).then(function(userData) {
    var data = userData.data.message;
    if (!data.applicationCompleted) {
      $location.path('/page2');
    }
  });


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
// - Code is to be written in JavaScript only. You won't need HTML or CSS.
// - Please write the code for each question directly below the question itself.
// - Hit Run at the bottom of the editor to test your code and execute any functions you've called.
// - Press "Save & Continue" when finished.
// - For this challenge, consider the words "argument" and "parameter" to be interchangable.
// - All variables and methods are persistent from question to question, so there is no need to redeclare anything!
// - PLEASE NOTE: You should also take a screenshot of your work (or copy it elsewhere) just in case!!
// - Please use Chrome!
// - You may use console.log to test/debug your work. The result of a console.log() call will display below the code editor.
//    - Example: console.log(yourFunction());

//////////////////////////PLEASE READ INSTRUCTIONS VERY CAREFULLY!//////////////////////////

// 1) Declare two variables, a string and an integer named "fullName" and "yearBorn". Set them equal to Linus Torvalds's name and the year he was born.




// 2) Declare an empty array called "myArray".
// Add the variables from the question above (fullName and yearBorn) to the empty array using the push method.
// Print to the console.




// 3) Write a simple function called "sayHello" that takes no parameters.
// Make it return "Hello!".
// Call the function.




// 4) Declare a variable named splitName and set it equal to fullName split into two seperate elements in an array.
// (In other words, the variable fullName is equal to "Linus Torvalds", then splitName should equal ["Linus", "Torvalds"].)
// Print splitName to the console.
// HINT: Remember to research the methods and concepts listed in the instructions PDF.




// 5) Write another function called "sayName" that takes no parameters.
// When called, this function should return "Hello, [name]!", where the name is equal to the first value in the splitName array from #4.
// Call the function.




// 6) Write another function named linusAge.  This function should take one parameter: the year Linus was born, and it should return the implied age.
// Call the function, passing the year Linus was born as the argument/parameter.
// HINT: http://www.w3schools.com/js/js_functions.asp




// 7) Using the basic function given below, add code to return the sum of all the odd numbers from 1 to 5000.  Don't forget to call the function!
// HINT: Consider using a 'for loop'.

function sum_odd_numbers() {
    var sum = 0;

    // Write your code here



    return sum;
}




// That's it! After you're satisfied, click "Save & Continue"

//////////////////////////////////////////////////////////////////
/////////////////////////////THE END!/////////////////////////////
//////////////////////////////////////////////////////////////////
    `;

    if (localStorage.getItem('code')) {
      $scope.code = localStorage.getItem('code');
    } else {
      $scope.code = initialCode;
    }

    $scope.runCode = function() {
      var code = _editor.getValue();

      saveLocally(code);

      // replace console.*, alerts, and such with postMessage so that webWorker can communicate back
      code = code.replace(/console.log|console.dir|console.error|alert|window.alert|document.write/g, "postMessage");

      // run client side code in a web worker
      var webWorker;
      var blob;
      var numMessagesReceived = 0;
      var resultLog = document.getElementById("result-log");

      if (typeof(Worker) !== "undefined") { // does the browser support web workers?

        if (typeof(webWorker) == "undefined") { //does webWorker already exist?
          blob = new Blob([code], {type: 'application/javascript'});
          webWorker = new Worker(URL.createObjectURL(blob));
        }

        // print console.log from the user's code to our console
        webWorker.onmessage = function(event) {
          numMessagesReceived++;
          if (numMessagesReceived > 100) {
            resultLog.innerText += '> Possible stack overflow or infinite loop detected. Terminating.\n';
            console.log('Possible stack overflow or infinite loop detected. Terminating.');
            webWorker.terminate();
            webWorker = undefined;
          }
          $timeout(function() {
            resultLog.innerText += '> ' + JSON.stringify(event.data) + '\n';
            console.log(JSON.stringify(event.data));
          }, 100);
        };

        // print any errors that may occur
        webWorker.onerror = function(event) {
          resultLog.innerText += '> ' + JSON.stringify(event.message) + '\n';
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

      // remind the user if they forgot to console.log()
      $timeout(function() {
        if (resultLog.textContent === "") {
          resultLog.innerText += '> Use console.log() if you want output to display here.\n';
        }
      }, 1000);


    var ifr = document.getElementById('jasmine');
    ifr.src = ifr.src;

    // reload jasmine spec runner
    $timeout(function() {

      console.log($rootScope.jasmineResults);

    }, 1000);


    };



    $scope.saveCode = function() {
      var code = _editor.getValue();

      saveLocally(code);

      var token = $cookies.get('token');

      // reload jasmine spec runner
      var ifr = document.getElementById('jasmine');
      ifr.src = ifr.src;

      $timeout(function() {
        $http.post(API + '/testCodeChallenge', { code: code, token: token, results: $rootScope.jasmineResults })
          .then(function(response) {
            //success
            $location.path('/schedule');
          })
          .catch(function(err) {
            if (err) {
              console.log('There was an error testing the code challenge: ', err);
            }
          });
      }, 1000);

    };
  }; // ends aceLoaded

  function saveLocally(code) {
    // attempt to save code from ACE in localstorage
    if (typeof(Storage) !== "undefined") {
      // if code already exists in localStorage, delete it firstname
      if (localStorage.getItem("code")) {
        localStorage.removeItem("code");
      }
      // Store
      localStorage.setItem("code", code);
    } else {
        // Sorry! No Web Storage support..
        alert('Please use Chrome to complete the code challenge!');
    }
  }

});
