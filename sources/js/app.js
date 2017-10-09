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
  $body.on('click', '.score__row', function() {
    app.currentPlayerId = $(this).attr('data-score-player-id');
  });


  app.showCustomScoreForm();
  app.showMenu();
  app.addScore();
  app.closeModal();


  $body.on('keyup', '.score__name', function(event) {
    app.getPlayerId($(this));
    app.updatePlayerName($(this).text());
  });


}); // /ready


})(jQuery);
