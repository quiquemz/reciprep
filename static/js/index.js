/***
File: index.js
Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
Description: The dynamic functionality of the recipe discover (index) page. All the functionality
of generating recipe cards, the swiping gestures, and adding to favorites are here. We interact
with the spoonacular API to pull in a continuous stream of random recipes for the user to
swipe through. There is a modal to allow users to directly add a recipe to their calendar.
***/

$(document).ready(() => {
  /*** Global and Constant Variables ***/
  const WEEK_DESCRIPTION = 'D MMM'; // Formats to display moment
  const LONG_WEEK_DAY = 'dddd, MMMM D';
  const DB_DATE = 'MM-DD-YYYY';

  const currentMoment = moment(); // To track current date

  /*** Constants & global variables ***/
  const LEFT = 0;
  const TOP = 1;
  const RIGHT = 2;
  const IN = 3;
  const OUT = 4;

  /*** Firebase Auth and DB ***/
  const auth = firebase.auth();
  const db = firebase.database();
  /*** Function definitions ***/
  function initializeIndexView() {
    try {
      const recipe = JSON.parse(localStorage.getItem('currentRecipe'));

      $('.r-cards-container').append(createCard(recipe, IN));
      getRandomRecipesAPI(true, 9);

      localStorage.setItem("currentRecipe", "");
      localStorage.setItem("removedRecipes", "[]");
    } catch (error) {
      getRandomRecipesAPI(true, 10);

      localStorage.setItem("currentRecipe", "");
      localStorage.setItem("removedRecipes", "[]");
    }
  }

  function createCard(recipe, initialPosition) {
    const backgroundCSS = 'center no-repeat, linear-gradient(rgba(255, 255, 255, 0) 65%, #888)';
    const backgroundSizeCSS = 'auto 100%';
    const rCardPositionCSS = (initialPosition === IN) ? 'r-card-in' :
      (initialPosition === LEFT) ? 'r-card-out-left' :
      (initialPosition === RIGHT) ? 'r-card-out-right' : 'r-card-out-top';
    const card =
      $(`<div class="r-card ${rCardPositionCSS}">
        <div class="r-card-content">
          <div class="r-card-main-content">
            <h5 class="r-card-title">${recipe.title}</h5>
            <div class="r-btn detail-btn">
              <i class="fa fa-info-circle"></i>
            </div>
          </div>
          <div class="r-card-secondary-content">
            <span class="r-card-text cuisine">${recipe.cuisines.concat(recipe.diets).join(', ')}</span>
            <div class="r-card-time">
              <div class="clock-icon">
                <i class="far fa-clock"></i>
              </div>
              <span class="r-card-text">${recipe.readyInMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>`);

    if (recipe.image) {
      card.css('background', `url(${recipe.image}) ${backgroundCSS}`);
      card.css('background-size', backgroundSizeCSS);
      $('.r-card-title').css('text-transform', 'capitalize');
      $('.cuisine').css('text-transform', 'capitalize');

      card.data('recipeTitle', recipe.title);
      card.data('recipeSourceUrl', recipe.sourceUrl);
      card.data('recipeId', recipe.id);
      card.data('recipeImage', recipe.image);
      card.data('recipeCuisines', recipe.cuisines);
      card.data('recipeDiets', recipe.diets);
      card.data('recipeReadyInMinutes', recipe.readyInMinutes);

      // Format ingredients
      var ingredients = [];
      if (recipe.extendedIngredients) {
        recipe.extendedIngredients.forEach(function(ingredient) {
          var ilist = [ingredient.name, ingredient.amount, ingredient.unit];
          ingredients.push(ilist);
        });
      }
      card.data('recipeIngredients', ingredients);

      card.on('click', () => {
        window.location.replace(`${window.location.origin}/recipe/${recipe.id}`);
        localStorage.setItem("currentRecipe", JSON.stringify({
          title: recipe.title,
          sourceUrl: recipe.sourceUrl,
          id: recipe.id,
          image: recipe.image,
          cuisines: recipe.cuisines,
          diets: recipe.diets,
          readyInMinutes: recipe.readyInMinutes,
          extendedIngredients: recipe.extendedIngredients
        }));
      });

      return card;
    }
  }

  function removeFirstCard() {
    const card = $('.r-card:last-child');
    card.remove(); // removing from DOM
  }

  function restoreRemovedCard() {
    const removedRecipes = JSON.parse(localStorage.getItem("removedRecipes"));

    if (removedRecipes.length > 0) {
      const recipe = removedRecipes.pop();
      const card = createCard(recipe, recipe.removedFrom);

      if (card) {
        $('.r-cards-container').append(card);

        // HACK: Needed so that it waits for append to finish and the animation applies.
        setTimeout(() => {
          card.removeClass('r-card-out-left');
          card.removeClass('r-card-out-right');
          card.removeClass('r-card-out-top');
          card.addClass('r-card-in');
        }, 1);

        localStorage.setItem('removedRecipes', JSON.stringify(removedRecipes));
      } else {
        alert('Server error.');
      }

    } else {
      alert('Nothing to restore.');
    }
  }

  function slideCard(direction) {
    const user = auth.currentUser;
    const card = $('.r-card:last-child');
    const removedRecipes = JSON.parse(localStorage.getItem("removedRecipes"));
    const recipeToRemove = {
      title: card.data('recipeTitle'),
      sourceUrl: card.data('recipeSourceUrl'),
      id: card.data('recipeId'),
      image: card.data('recipeImage'),
      cuisines: card.data('recipeCuisines'),
      diets: card.data('recipeDiets'),
      readyInMinutes: card.data('recipeReadyInMinutes')
    }

    switch (direction) {
      case LEFT:
        card.addClass('r-card-out-left');
        recipeToRemove.removedFrom = LEFT;
        // NOTE: Wait till transition ends to delete it
        $('.r-card:last-child').on('transitionend', () => removeFirstCard());
        break;
      case TOP:
        card.addClass('r-card-out-top');
        recipeToRemove.removedFrom = TOP;
        // NOTE: Wait till transition ends to open modal it
        card.on('transitionend', () => toggleModal("open"));
        break;
      case RIGHT:
        card.addClass('r-card-out-right');
        recipeToRemove.removedFrom = RIGHT;
        // NOTE: Wait till transition ends to delete it
        card.on('transitionend', () => removeFirstCard());
        addToFavoritesDB();
        break;
      default:
    }

    removedRecipes.push(recipeToRemove);
    localStorage.setItem('removedRecipes', JSON.stringify(removedRecipes)); // removing from local storage
    getRandomRecipesAPI(auth.currentUser, 1);
  }

  function toggleModal(action) {
    removeFirstCard();

    if (action === "save") {
      addToCalendarDB();
      addToGroceriesDB();
    }

    if (action === "close") {
      restoreRemovedCard();
    }

    $('#myModal').modal('toggle');
  }

  function getRandomRecipesAPI(user, ammount) {
    const URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?limitLicense=false&number=${ammount}`;

    if (user) {
      $.ajax({
        url: URL,
        type: 'GET',
        dataType: 'json',
        headers: {
          'X-Mashape-Key': 'fE0JDoXOrQmshCwRo1DwJRH2XhXKp1YnYEAjsnBx1IKReJz2Bv'
        },
        success: (data) => {
          data.recipes.forEach(recipe => {
            const card = createCard(recipe, IN);

            if (card) {
              $('.r-cards-container').prepend(card);
            }
          });
        }
      });
    }
  }

  function addToFavoritesDB() {
    const card = $('.r-card:last-child');

    if (auth.currentUser) {
      const recipeTitle = card.data('recipeTitle');
      const recipeId = card.data('recipeId');

      db.ref('users/' + auth.currentUser.uid)
        .child('favoriteRecipes')
        .update({
          [recipeId]: recipeTitle
        });
    }
  }

  function addToCalendarDB() {
    const dateObj = $('#datetimepicker12').data("DateTimePicker").date();
    const year = dateObj['_d'].getYear() - 100 + 2000;
    const recipeId = $('.r-card:last-child').data('recipeId');
    const recipeTitle = $('.r-card:last-child').data('recipeTitle');
    const cmCopy = currentMoment.clone(); // moment() is mutable
    let date = dateObj['_d'].getDate();
    let month = dateObj['_d'].getMonth() + 1;

    if (month < 10)
      month = '0' + month;
    if (date < 10)
      date = '0' + date;

    const meal = $("#meals-tab .active").text().replace(/\s/g, '').toLowerCase();
    const dbDateObj = "" + month + "-" + date + "-" + year;

    if (auth.currentUser) {
      // Calendar
      db.ref(`/users/${auth.currentUser.uid}/calendar/${dbDateObj}/${meal}`)
        .update({
          [recipeId]: recipeTitle
        });
    }
  }

  function addToGroceriesDB() {
    const recipeId = $('.r-card:last-child').data('recipeId');
    const cmCopy = currentMoment.clone(); // moment() is mutable
    const URL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information`;

    if (auth.currentUser) {
      // GETTING INGREDIENTS FROM API
      $.ajax({
        url: URL,
        type: 'GET',
        dataType: 'json',
        headers: {
          'X-Mashape-Key': 'fE0JDoXOrQmshCwRo1DwJRH2XhXKp1YnYEAjsnBx1IKReJz2Bv'
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


  /*** Initializer ***/
  initializeIndexView();

  /*** Event Handlers ***/
  $('#datetimepicker12').datetimepicker({
    inline: true,
    sideBySide: true,
    format: 'DD/MM/YYYY'
  });
  $('.next-btn').on('click', () => slideCard(LEFT));
  $('.calendar-btn').on('click', () => slideCard(TOP));
  $('.favorites-btn').on('click', () => slideCard(RIGHT));
  $('.restore-recipe-btn').on('click', () => restoreRemovedCard());
  $('.close-calendar-modal-btn').on('click', () => toggleModal("close"));
  $('#save-to-calendar-btn').on('click', () => toggleModal("save"));
});