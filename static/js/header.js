/*
  File: header.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: This file containes the main code to dynamically build the header
  of the views. This was necessary so that we did not have to manually set the
  names, buttons and function invokations. All the views that use a header, should
  add this file to their sources. Note that it is needed to add some markup
  code to the files to (see index.html for an example).
*/

$(document).ready(function() {

  // Function definitions
  function getCurrentPage() {
    return window.location.pathname.replace('.html', '');
  }

  function initializeHeader(location) {
    switch (location) {
      case '/':
      case '/home':
      case '/favorites':
      case '/grocerylist':
        $('#header').css('background', '#FDFDFD').css('color', '#363046');
        break;
      case '/discover':
        $('#header').css('background', '#FDFDFD').css('color', '#363046');
        $('.right-header-btn').append('<i class="fa fa-undo-alt"></i>');
        break;
      case '/login':
      case '/signup':
        $('#header').css('background', '#FDFDFD');
        $('h5').css('color', '#363046').css('font-weight', '100');
        $('.left-header-btn').append('<i class="fa fa-chevron-left"></i>').css('color', '#363046');
        break;
      case '/calendar':
        $('#header').css('background', '#FDFDFD').css('color', '#363046');
        $('.right-header-btn').css('color', '#363046').append('<i class="fa fa-list-alt"></i>');
        break;
      default:
        $('#header').css('background', '#FDFDFD');
        $('h5').css('color', '#363046').css('font-weight', '100');
        $('.left-header-btn').append('<i class="fa fa-chevron-left"></i>').css('color', '#363046');
        break;
    }
  }

  function goBack() {
    var currentPage = getCurrentPage();
    if (currentPage == '/login' || currentPage == '/signup') {
      window.location.href = '/home';
    } else if (currentPage.match('recipe') == 'recipe') {
      var comingFromFavorites = window.location.search.substring(1).split("?")[0];
      if (comingFromFavorites == 'favorites')
        window.location.href = '/favorites';
      else
        window.location.href = '/discover';
    }
  }

  // Plain Function Invokations
  initializeHeader(getCurrentPage());

  // Event Handlers
  $('.left-header-btn').on('click', () => goBack());
});