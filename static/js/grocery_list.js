/*
  File: grocery_list.js
  Author: Saul Mendez, Akanksha Kevalramani, Adam Abadilla
  Description: This file is to handle the events that occur on the grocery_list.
  This file should only be invoked by the grocery_list view. It contains the
  necessary code to access the user, the DB, and to retrieve the recipes saved on
  a specific week/day.
*/

$(document).ready(() => {

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

  function getThisWeeksIngredients() {
    const cmCopy = currentMoment.clone(); // moment() is mutable

    $('.grocery-list-head').remove();
    $('.grocery-list-body').remove();

    db.ref(`/users/${auth.currentUser.uid}/groceries/${cmCopy.isoWeekday(1).format(DB_DATE)}`).once('value', res => {
      const recipes = res.val()
      if (recipes) {
        $('.non-empty-state').show();
        $('.empty-state').hide();

        const ingredientsHeader = $(
          `<thead class="grocery-list-head">
            <tr>
              <th scope="col">Ingredients</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>`
        );
        const ingredientsBody = $(
          `<tbody class="grocery-list-body">
          </tbody>`
        );

        $('.grocery-list').append(ingredientsHeader);
        $('.grocery-list').append(ingredientsBody);



        Object.keys(recipes).forEach(id => {
          recipes[id].forEach(ingredient => {
            const ingredientsItem = $(
              `<tr>
                <td>${ingredient.name}</td>
                <td>${ingredient.amount} ${ingredient.unit}</td>
              </tr>`
            );
            $('.grocery-list-body').append(ingredientsItem);
          })
        });

      } else {
        $('.non-empty-state').hide();
        $('.empty-state').show();
      }
    });

  }

  /*** Initializers ***/
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setWeek();
      getThisWeeksIngredients();
    }
  });

  /*** Event Handlers ***/
  $('.prev-week-btn').on('click', () => {
    setWeek('prev');
    getThisWeeksIngredients();
  });
  $('.next-week-btn').on('click', () => {
    setWeek('next');
    getThisWeeksIngredients();
  });

});