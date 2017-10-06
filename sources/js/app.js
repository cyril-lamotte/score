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

  var $body = $('body');

  // Set current player.
  //$body.on('click', '.score__row', function() {
  //  app.currentPlayerId = $(this).attr('data-score-player-id');
  //});


  $body
    .on('click', 'button[data-init="add-score"]', function(event) {

      $('.score__row--is-active').removeClass('.score__row--is-active');

      // Show score form.
      $('#modal-add').show();
      $body.addClass('modal-open');
      $(this).parents('.score__row').addClass('score__row--is-active')
      app.getPlayerId($(this));

  }).on('click', 'button[data-init="close-modal"]', function(event) {

    // Hide score form.
    $('#modal-add').hide();
    $body.removeClass('modal-open');

  }).on('click', 'button[data-score-add-to]', function(event) {

    // Add value from select.
    var addedValue = parseInt($('#add').val());
    app.updateScore(addedValue);

  }).on('click', 'button[data-init="add-score-fixed"]', function(event) {
    event.preventDefault();

    var value = parseInt($(this).attr('data-score-value'));
    app.getPlayerId($(this));
    app.updateScore(value);

  }).on('click', 'button[data-init="init-score"]', function(event) {
    event.preventDefault();

    app.getPlayerId($(this));
    app.updateScore(0);

  });


  $body.on('keyup', '.score__name', function(event) {
    app.getPlayerId($(this));
    app.updatePlayerName($(this).text());
  });


}); // /ready


})(jQuery);
