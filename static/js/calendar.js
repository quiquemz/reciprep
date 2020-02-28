/*
  File: calendar.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: This file is to handle the events that occur on the calendar view.
  This file should only be invoked by the calendar view. It contains the
  necessary code to access the user, the DB, and to retrieve the recipes to cook
  of an specific day/week. When setting the desired week, all the necessary code
  is invoked to build the page.
*/

$(document).ready(function() {
  /*** Global and Constant Variables ***/
  const WEEK_DESCRIPTION = 'D MMM'; // Formats to display moment
  const LONG_WEEK_DAY = 'dddd, MMMM D';
  const DB_DATE = 'MM-DD-YYYY';

  const currentMoment = moment(); // To track current date

  /*** Firebase Auth and DB ***/
  const auth = firebase.auth();
  const db = firebase.database();

  /*** Function definitions ***/
  function setWeek(week) {
    if (week === 'prev') {
      currentMoment.subtract(1, 'week');
    } else if (week === 'next') {
      currentMoment.add(1, 'week');
    }
    setWeekName();
    setWeekStartDay();
    setWeekEndDay();
    setCurrentWeekDay();
  }

  function setWeekName() {
    const m = moment();
    if (currentMoment.isSame(m, 'isoWeek')) {
      $('.week-name').html('<h5>This Week</h5>');
    } else if (currentMoment.isBefore(m, 'isoWeek')) {
      $('.week-name').html(`<h5>${m.diff(currentMoment, 'weeks')} Weeks Ago</h5>`);
    } else {
      // HACK: added 1 mannualy... double check
      $('.week-name').html(`<h5>${currentMoment.diff(m, 'weeks') + 1} Weeks After</h5>`);
    }
  }

  function setWeekStartDay() {
    const cmCopy = currentMoment.clone(); // moment() is mutable
    $('.week-start-day').html(cmCopy.isoWeekday(1).format(WEEK_DESCRIPTION));
  }

  function setWeekEndDay() {
    const cmCopy = currentMoment.clone(); // moment() is mutable
    $('.week-end-day').html(cmCopy.isoWeekday(7).format(WEEK_DESCRIPTION));
  }

  function setCurrentWeekDay(e) {
    // set the current moment from evnt
    if (e) {
      currentMoment.isoWeekday($(e.target).attr('id'));
    }

    // Change the active week day row (e.g. M, T, W, etc.)
    $('.week-days').find('.active').removeClass('active');
    $(`#${currentMoment.format(LONG_WEEK_DAY)}`).addClass('active');

    // Set the active day text (e.g. Monday, Tuesday, etc.)
    $('.active-day').html(currentMoment.format(LONG_WEEK_DAY));
    getCalendarFromDB();
  }

  function addRecipeItem(recipeId, meal, name) {
    const listItem = $(
      `<li class="list-group-item ${meal}-recipe">
        <div class="name">${name}</div>
        <div class="r-btn remove-recipe-btn action"><i class="fa fa-trash"></i></div>
      </li>`);

    listItem.find('.name').on('click', () => window.location.replace(`${window.location.origin}/recipe/${recipeId}`));
    listItem.find('.remove-recipe-btn').on('click', (e) => {
      removeRecipeItem(e)
      removeFromCalendarDB(meal, recipeId);
      removeFromGroceriesDB(recipeId);
    });

    $(`.list-${meal}`).append(listItem);
  }

  function removeRecipeItem(e) {
    $(e.target).closest('.list-group-item').remove();
  }

  function addRecipeItemCallback(recipeId, type, recipeTitle) {
    return function() {
      addRecipeItem(recipeId, type, recipeTitle);
      addToCalendarDB(recipeId, type, recipeTitle);
      addToGroceriesDB(recipeId, type, recipeTitle);
      $('#myModal').modal('toggle');
    }
  }

  function loadMoreFavorites(recipes, type, recipeList, displayNum) {
    $('#myModalList li:last-child').remove();

    var originalDisplayNum = displayNum;
    if (displayNum + 10 < recipeList.length)
      displayNum += 10;
    else
      displayNum = recipeList.length;

    for (let i = originalDisplayNum; i < displayNum; i++) {
      var recipeId = recipeList[i];
      var recipeTitle = recipes[recipeId];

      $('#myModalList').append(`<li class="list-group-item" id="${recipeId}">${recipeTitle}</li>`);
      $('#' + recipeId).click(addRecipeItemCallback(recipeId, type, recipeTitle));
    }
    if (displayNum < recipeList.length) {
      $('#myModalList').append(`<li class="list-group-item" id="load-more">Load More</li>`);
      $('#load-more').on('click', () => loadMoreFavorites(recipes, type, recipeList, displayNum));
    }
  }

  function clearMealsRecipes() {
    $('.breakfast-recipe').remove();
    $('.lunch-recipe').remove();
    $('.dinner-recipe').remove();
  }

  function toggleModal(type) {
    // Get user's favorite recipes
    getFavoriteRecipesDB(type);
    $('#myModal').modal('toggle');
  }

  function addToCalendarDB(recipeId, meal, name) {
    db.ref(`/users/${auth.currentUser.uid}/calendar/${currentMoment.format(DB_DATE)}/${meal}`)
      .update({
        [recipeId]: name
      });
  }

  function addToGroceriesDB(recipeId) {
    const cmCopy = currentMoment.clone(); // moment() is mutable
    const URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`;

    if (auth.currentUser) {
      // GETTING INGREDIENTS FROM API
      $.ajax({
        url: URL,
        type: 'GET',
        dataType: 'json',
        headers: {
          "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
	        "x-rapidapi-key": "THeQXDKUAjmshA5IuXWyvEBwQgBKp1F428ejsnvIwlO566vwoN"
        },
        success: (recipe) => {
          const ingredients = [];
          recipe.extendedIngredients.forEach(ingredient => {
            ingredients.push({
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              original: ingredient.original
            });
          });

          // SETTING GORCERIES IN DB
          db.ref(`/users/${auth.currentUser.uid}/groceries/${cmCopy.isoWeekday(1).format(DB_DATE)}`)
            .update({
              [recipeId]: ingredients
            });
        }
      });
    }
  }

  function removeFromCalendarDB(meal, recipeId) {
    db.ref(`/users/${auth.currentUser.uid}/calendar/${currentMoment.format(DB_DATE)}/${meal}/${recipeId}`).remove();
  }

  function removeFromGroceriesDB(recipeId) {
    const cmCopy = currentMoment.clone(); // moment() is mutable
    db.ref(`/users/${auth.currentUser.uid}/groceries/${cmCopy.isoWeekday(1).format(DB_DATE)}/${recipeId}`).remove();
  }

  function getCalendarFromDB() {
    if (auth.currentUser) {
      clearMealsRecipes();

      db.ref(`/users/${auth.currentUser.uid}/calendar/${currentMoment.format(DB_DATE)}`).once('value', res => {
        const meals = res.val();
        if (meals) {
          Object.keys(meals).forEach(meal => {
            const recipes = meals[meal];
            Object.keys(recipes).forEach(recipeId => {
              const name = recipes[recipeId];
              addRecipeItem(recipeId, meal, name);
            })
          })
        }
      });
    }
  }

  function getFavoriteRecipesDB(type) {
    if (auth.currentUser) {
      $('#myModalList').empty();

      // Get user database snapshot
      db.ref(`/users/${auth.currentUser.uid}/favoriteRecipes`).once("value", res => {
        const recipes = res.val();

        var displayNum = 0;
        var recipeList = Object.keys(recipes);
        var actualRecipeListLength = recipeList.length / 2;
        if (actualRecipeListLength < 5)
          displayNum = actualRecipeListLength;
        else
          displayNum = 5;

        for (let i = 0; i < displayNum; i++) {
          var recipeId = recipeList[i];
          var recipeTitle = recipes[recipeId];

          $('#myModalList').append(`<li class="list-group-item" id="${recipeId}">${recipeTitle}</li>`);
          $('#' + recipeId).click(addRecipeItemCallback(recipeId, type, recipeTitle));
        }
        if (displayNum < actualRecipeListLength) {
          $('#myModalList').append(`<li class="list-group-item" id="load-more">Load More</li>`);
          $('#load-more').on('click', () => loadMoreFavorites(recipes, type, recipeList, displayNum));
        }
      });
    }
  }

  /*** Initializers ***/
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setWeek();
    }
  });

  /*** Event Handlers ***/
  $('.right-header-btn').on('click', () => window.location.href = '/grocerylist');

  $('.add-breakfast-btn').on('click', () => toggleModal('breakfast'));
  $('.add-lunch-btn').on('click', () => toggleModal('lunch'));
  $('.add-dinner-btn').on('click', () => toggleModal('dinner'));

  $('.prev-week-btn').on('click', () => setWeek('prev'));
  $('.next-week-btn').on('click', () => setWeek('next'));

  $('.right-header-btn').on('click', () => window.location.replace(`${window.location.origin}/grocerylist`));
  $('.day-btn').on('click', (e) => setCurrentWeekDay(e));
});
