var fullName = "Alan Turing";
var ageAtDeath = 41;
var myArray = [];
myArray.push(fullName);
myArray.push(ageAtDeath);
console.log(myArray);

function sayHello() {
  return "now!";
}
sayHello();

var splitName = fullName.split(" ");

function sayName() {
  return 'Hello, ' + splitName[0];
}

function alanAgeNow(yearBorn) {
  return new Date().getFullYear() - yearBorn;
}

function sum_odd_numbers() {
  var sum = 0;
  for (var i = 1; i <= 5000; i = i + 2) {
    sum += i;
  }
  return sum;
}
