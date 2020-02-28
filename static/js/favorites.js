/*
  File: favorites.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: This file is to handle the events that occur on the favorites view.
  This file should only be invoked by the favorites view. It contains the
  necessary code to access the user, the DB, and to retrieve the favorite recipes
  of the specific user.
*/

$(document).ready(function() {

  /*** Firebase Auth and DB ***/
  const auth = firebase.auth();
  const db = firebase.database();

  function viewRecipe(recipeId) {
    return function() {
      window.location.href = '/recipe/' + recipeId + '?favorites';
    }
  }

  function initializeFavorites() {
    if (auth.currentUser) {
      $('#myList').empty();

      // Get user database snapshot
      db.ref(`/users/${auth.currentUser.uid}/favoriteRecipes`).once("value", res => {
        const recipes = res.val();
        if (recipes) {
          $('.favorites-empty-state').hide();
          var recipeList = Object.keys(recipes);
          for (let i = 0; i < recipeList.length/2; i++) {
            var recipeId = recipeList[i];
            var recipeTitle = recipes[recipeId];
            loadRecipe(recipeId);
          }
        }
        else
          $('.favorites-empty-state').show();
      });
    }
  }

  function loadRecipe(recipeId) {
    recipeId = recipeId.substring(0, 6);
    const URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`;

    $.ajax({
      url: URL,
      type: 'GET',
      dataType: 'json',
      headers: {
        "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
        "x-rapidapi-key": "THeQXDKUAjmshA5IuXWyvEBwQgBKp1F428ejsnvIwlO566vwoN"
      },
      success: (data) => {
        createRecipeListItem(data);
      }
    });
  }

  function createRecipeListItem(recipe) {
    const backgroundCSS = 'center no-repeat, linear-gradient(rgba(255, 255, 255, 0) 10%, #777)';
    const backgroundSizeCSS = 'auto';
    const imageCard = $(
      `<div class="image-card" id="${recipe.id}">
      <div class="image-card-content">
        <div class="image-card-main-content">
          <h6 class="image-card-title">${recipe.title}</h6>
        </div>
      </div>
    </div>`
    );

    imageCard.css('background', `url(${recipe.image}) ${backgroundCSS}`);
    imageCard.css('background-size', backgroundSizeCSS);
    imageCard.data('recipeTitle', recipe.title);
    imageCard.data('recipeSourceUrl', recipe.sourceUrl);
    imageCard.data('recipeId', recipe.id);
    $('#cuisine').css('text-transform', 'capitalize');
    $('.favorites-list').append(imageCard);
    $('#' + recipe.id).on('click', viewRecipe(recipe.id));
  }

  /*** Initializers ***/
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      initializeFavorites();
    }
  });

});
