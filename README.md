# DC Student Application

## Overview
An online application portal for DigitalCrafts. Prospective students can register for an account, login, and save their progress throughout the application process. Should the student forget their password, they can request a temporary password which will be automatically emailed to them. After the student finishes and submits the application, DigitalCrafts will be sent an email containing the application information.

After completion of the application form, the student can then progress on to the code challenge. The code challenge can be completed online in our built in editor. When the user clicks to run their code, we evaluate the code in a web worker and run a Jasmine suite which complies results in a custom reporter and displays them to the user. When the user submits their code challenge, another email is sent to DigitalCrafts summarizing their results. After completing the code challenge, users can schedule an interview through our Calendly integration. After scheduling an interview, the user application process is complete.

If the user has administrative rights, they are redirected to the Admin Dashboard upon login. The dashboard displays summarized data on applicant progress throughout the application portal. This data is shown with a pie chart as well as in a sortable table.



### Technologies, frameworks, & programming languages used
* JavaScript
* MongoDB
  * Application settings are stored in one collection, while user data is stored in a separate collection.
* AngularJS
  * Used to make this project a single-page application.
* Node.js
* Node modules:
  * Mongoose
  * Express
  * cors
  * busboy
    * Used to stream upload of resume.
  * body-parser
  * rand-token
    * Generating user authentication token as well as temporary password for reset password functionality.
  * my-bcrypt
    * Used to hash user passwords.
  * nodemailer
    * Used to send automated emails.
* Bootstrap
* Web workers
  * Used to run user generated code on the client side.
* Ace
  * Used to integrate a code editor into our application.
* Jasmine
  * With custom reporter to run test cases on user generated code and then display the results.



### Screenshots

Login page

![Login Page](frontend/img/login.png)


Application page

![Application Page](frontend/img/app-form.png)


Reset password email

![Reset Password Email](frontend/img/newpassword.png)


Code challenge
![Code Challenge Page](frontend/img/code.png)


Schedule Interview
![Schedule Interview](frontend/img/interview.png)


Application Completed!
![Application finished](frontend/img/finish.png)


Administrator Dashboard
![Administrator Dashboard](frontend/img/admin.png)



### Demo video
[![Application Portal Demo Video](http://img.youtube.com/vi/9bM60jWP5yU/0.jpg)](http://www.youtube.com/watch?v=9bM60jWP5yU "DigitalCrafts Application Portal")

### Contributors
We utilized mob programming throughout the development of this.

* Application Form, Code Challenge, Calendly Integration, Admin Dashboard
  * [Carolyn Daniel](https://github.com/csdaniel17)
  * [Kyle Luck](https://github.com/kyleluck)

* Application Form
  * [Matthew Brimmer](https://github.com/mbrimmer83)



### Live demo
Look for it soon on [DigitalCrafts](http://digitalcrafts.com/)!
