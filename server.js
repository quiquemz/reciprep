'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const admin = require('firebase-admin');
// import * as admin from 'firebase-admin';

const app = express();
const server = http.createServer(app);

/********** Firebase Admin SDK Setup **********/
var serviceAccount = require('./getreciprep-7d245d0f1049.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://getreciprep.firebaseio.com/'
});

/************** Routes **************/
app.get('/', function(req, res) {
  let idToken = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  }

  admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      res.send('Login Successful');
    }).catch(function(error) {
      res.redirect('/home');
      res.send('Login Failed');
    });
});

app.get('/home', (req, res) => res.sendfile('static/main_index.html'));

app.get('/login', (req, res) => res.sendfile('static/login.html'));

app.get('/signup', (req, res) => res.sendfile('static/signup.html'));

app.get('/discover', (req, res) => res.sendfile('static/index.html'));

app.get('/calendar', (req, res) => res.sendfile('static/calendar.html'));

app.get('/favorites', (req, res) => res.sendfile('static/favorites.html'));

app.get('/grocerylist', (req, res) => res.sendfile('static/grocery_list.html'));

app.get('/recipe/:recipeId', (req, res) => res.sendfile('static/recipe.html'));

// app.get('*', (req, res) => res.sendfile('static/404.html'));

/************** Server **************/
app.use(express.static('static'));

server.listen(3001, 'localhost');
server.on('listening', () => {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});