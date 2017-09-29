(function($) {

"use strict";

app.init = function() {

  app.checkCompatibility();

  // For dev.
  //app.deleteDb();

  // Prod.
  app.createDB();

};

app.init();


$(function() {


  // Set current player.
  $('body').on('click', '.score__row', function() {
    app.currentPlayerId = $(this).attr('data-score-player-id');
  });

  $('body')
    .on('click', 'button[data-init="add-score"]', function(event) {

      // Show score form.
      $('#modal-add').show();
      app.getPlayerId($(this));

  }).on('click', 'button[data-init="close-modal"]', function(event) {

    // Hide score form.
    $('#modal-add').hide();

  }).on('click', 'button[data-score-add-to]', function(event) {

    // Add value from select.
    var addedValue = parseInt($('#add').val());
    app.updateScore(addedValue);

  }).on('click', 'button[data-init="add-score-fixed"]', function(event) {
    event.preventDefault();

    var value = parseInt($(this).attr('data-score-value'));
    app.getPlayerId($(this));
    app.updateScore(value);

  });


}); // /ready


/**
 * Update score in interface & launch BDD update.
 */
app.updateScore = function(value) {

  var $score = $('#score-player-' + app.currentPlayerId);
  var currentScore = parseInt($score.text());
  var total = currentScore + value;

  $score.text(total);

  // Update database.
  app.updateScoreDB(app.currentPlayerId, total);

};


/**
 * Get player id in the DOM.
 */
app.getPlayerId = function($el) {
  app.currentPlayerId = $el.parents('.score__row').attr('data-score-player-id');
};


})(jQuery);
