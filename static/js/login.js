$(document).ready(function() {

  /***
  File: login.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: Takes user email and password and tries to authenticate the session
  through firebase.
  ***/

  /*** Firebase Auth and DB ***/
  const auth = firebase.auth();
  const db = firebase.database();

  /*** Function definitions ***/
  function login(e) {
    e.preventDefault();

    const username = $('#username').val();
    const email = $('#email').val();
    const password = $('#password').val();


    auth.signInWithEmailAndPassword(email, password)
      .then(res => {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            user.getIdToken().then(function(idToken) { //idToken is the user's firebase token
              $.ajax({
                url: '/',
                type: 'GET',
                headers: {
                  'Authorization': 'Bearer ' + idToken
                },
                success: (status) => {
                  if (status == 'Login Successful')
                    window.location.href = "/discover"
                }
              });
            });
          }
        });
      })
      .catch(e => {
        alert(e.message);
      });
  }

  /*** Event Handlers ***/
  $('#email-login-form').on('submit', (e) => login(e));
});