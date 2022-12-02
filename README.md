# TinyApp
TinyApp is a web server that shortens URL's.
## Description
Users can start by creating an account, once logged in they can view, create, update or delete their url's. Once a url has been created, it gets added to the database, the user can now visit the link via the shortened url. Once finised with their session they can logout.
**_BEWARE:_ This library was published for learning purposes. It is _not_ intended for use in production-grade software.**
This project was created and published by me as part of my learnings at Lighthouse Labs.

## Final Product

Screenshot of the user registration page:

!["screenshot of registration page"](https://github.com/juntaodev/tinyapp/blob/main/assets/registerpage.png)

Screenshot of the users URL's page:

!["screenshot of url edit page"](https://github.com/juntaodev/tinyapp/blob/main/assets/editpage.png)

Screenshot of the users URL info page:

!["screenshot of my urls page"](https://github.com/juntaodev/tinyapp/blob/main/assets/myurlpage.png)

## Installation
* Fork and clone this repository
* Install all dependencies(`npm install`)
* Initialize web server from command-line with:
  `npm start`
* localhost:8080/ to connect to server from browser
  * IP address: localhost
  * PORT: 8080

## Dependencies
* Node.js
* Express
* EJS
* bcryptjs
* cookie-session
* method-override
