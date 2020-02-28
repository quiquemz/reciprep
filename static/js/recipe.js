$(document).ready(() => {

  /***
  File: recipe.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: The dynamic functionality of the recipe page. Given a recipeId (retrieved as a GET variable)
  we pull the recipe ingredients, instructions, pictures, and nutritional information. We display the nutritional
  information (Carbs, Fat, Protein) as a pie chart data visualization at the bottom of the page.
  ***/

  /*** Constants & global variables ***/
  const d3 = Plotly.d3;
  const WIDTH_IN_PERCENT_OF_PARENT = 90,
    HEIGHT_IN_PERCENT_OF_PARENT = 50;

  /*** Firebase Auth and DB ***/
  const auth = firebase.auth();
  const db = firebase.database();

  /*** Function definitions ***/
  function loadRecipe() {
    const recipeId = window.location.pathname.replace('/recipe/', '');
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
        createRecipeImageCard(data);
        createRecipeIngredients(data);
        createRecipeInstructions(data);
      }
    });
  }

  function createRecipeImageCard(recipe) {
    getNutritionInfo(recipe.id);
    const backgroundCSS = 'center no-repeat, linear-gradient(rgba(255, 255, 255, 0) 40%, #777)';
    const backgroundSizeCSS = 'auto';
    const imageCard = $(
      `<div class="image-card">
        <div class="image-card-content">
          <div class="image-card-main-content">
            <h5 class="image-card-title">${recipe.title}</h5>
          </div>
          <div class="image-card-secondary-content">
            <span class="image-card-text">${recipe.cuisines.concat(recipe.diets).join(', ')}</span>
            <div class="image-card-time">
              <div class="clock-icon">
                <i class="far fa-clock"></i>
              </div>
              <span class="image-card-text">${recipe.readyInMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>`
    );

    imageCard.css('background', `url(${recipe.image}) ${backgroundCSS}`);
    imageCard.css('background-size', backgroundSizeCSS);
    imageCard.data('recipeTitle', recipe.title);
    imageCard.data('recipeSourceUrl', recipe.sourceUrl);
    imageCard.data('recipeId', recipe.id);

    $('#content').prepend(imageCard);
  }

  function createRecipeIngredients(recipe) {
    const ul = $('<ul></ul>');
    recipe.extendedIngredients.forEach(ingredient => {
      ul.append(`<li>${ingredient.originalString}</li>`);
    });
    $('.ingredients').append(ul)
  }

  function createRecipeInstructions(recipe) {
    const ol = $('<ol></ol>');
    recipe.analyzedInstructions.forEach(instruction => {
      instruction.steps.forEach(stepInfo => {
        ol.append(`<li>${stepInfo.step}</li>`);
      });
    });
    $('.instructions').append(ol)
  }

  function getNutritionInfo(recipeId) {

    $.ajax({
      url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${recipeId}/information?includeNutrition=true`,
      type: 'GET',
      dataType: 'json',
      headers: {
        "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
        "x-rapidapi-key": "THeQXDKUAjmshA5IuXWyvEBwQgBKp1F428ejsnvIwlO566vwoN"
      },
      success: (data) => {

        var labels = ["Carbs", "Fat", "Protein"];
        var values = [data.nutrition.caloricBreakdown.percentCarbs,
          data.nutrition.caloricBreakdown.percentFat,
          data.nutrition.caloricBreakdown.percentProtein
        ];

        populateNutritionChart(labels, values);

      }
    });
  }

  function populateNutritionChart(labels, values) {
    var customColors = ['rgb(56, 75, 126)', 'rgb(18, 36, 37)', 'rgb(34, 53, 101)'];

    const data = [{
      values: values,
      labels: labels,
      type: 'pie',
      marker: {
        colors: customColors
      },
      insidetextfont: {
        color: 'rgb(255, 255, 255)'
      }
    }];
    const recipesPie = d3.select("div[id='nutrition-chart']").node();

    Plotly.newPlot(recipesPie, data);
    window.addEventListener('resize', function() {
      Plotly.Plots.resize(recipesPie);
    });
    // Plotly.newPlot('nutrition-chart', data, layout);
  }

  /*** Initializer ***/
  loadRecipe();

  /*** Event Handlers ***/


});
