function FoodPreferences(diets = new Diets(), allergies = new Allergies()) {
  this.diets = diets;
  this.allergies = allergies;
}

function Diets() {
  this.vegetarian = false;
  this.vegan = false;
}

function Allergies() {
  this.nuts = false;
}