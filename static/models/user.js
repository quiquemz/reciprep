// User constructor
function User(email, name = '', profilePicture = '',
  foodPreferences = new FoodPreferences(), favoriteRecipes = [],
  calendar = new Calendar(), groceries = new Groceries()) {

  this.email = email;
  this.name = name;
  this.profilePicture = profilePicture;
  this.foodPreferences = foodPreferences;
  this.favoriteRecipes = favoriteRecipes;
  this.calendar = calendar;
  this.groceries = groceries;
}