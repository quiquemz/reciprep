$(document).ready(function() {

  /***
  File: initFirebase.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: This file contains the configuration settings and keys necessary to
  connect to firebase resources such as the database and login system.
  ***/

  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyA-x_cU9s1GL2PNsOJitfG2_vZ9rmOLlE8",
    authDomain: "getreciprep.firebaseapp.com",
    databaseURL: "https://getreciprep.firebaseio.com",
    projectId: "getreciprep",
    storageBucket: "",
    messagingSenderId: "993290235242"
  };
  firebase.initializeApp(config);
});