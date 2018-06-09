$(document).ready(function() {

  /***
  File: sidebar.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: Adding event handlers to the tabs of the sidebar, like toggling the sidebar menu, signing up, and
  logging out.
  ***/

  /*** Firebase user management ***/
  const auth = firebase.auth();

  /*** Function definitions ***/
  function sidebarSetup(user) {
    if (user) {
      $('#login-btn').hide();
      $('#signup-btn').hide();
      $('#logout-btn').show();
    } else {
      $('#login-btn').show();
      $('#signup-btn').show();
      $('#logout-btn').hide();
    }
  }

  function openSidebar() {
    $('#sidebar').addClass('active');
    $('.overlay').fadeIn();
  }

  function closeSidebar() {
    $('#sidebar').removeClass('active');
    $('.overlay').fadeOut();
  }

  function logout() {
    auth.signOut()
      .then(() => {
        // TODO Establish workflow when signing out
        window.location = "/";
        // closeSidebar();
      })
      .catch(error => {
        console.log(error)
        // TODO handle error
        // TODO prompt user with error;
      });
  }

  /*** Sidebar Setup ***/
  // Sidebar Setup depending if user is logged in or not.
  // Observer: looks up for user state change
  auth.onAuthStateChanged(user => sidebarSetup(user));

  /*** Event Handlers ***/
  $('.open-sidebar-btn').on('click', () => openSidebar());
  $('.close-sidebar-btn, .overlay').on('click', () => closeSidebar());
  $('#logout-btn').on('click', () => logout());




});