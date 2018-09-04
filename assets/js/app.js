(function($) {

"use strict";

app.init = function() {

  // For dev.
  app.deleteDb();

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

  app.managePlayers();


  $body.on('keyup', '.score__name', function(event) {
    app.setPlayerId($(this));
    app.updatePlayerName($(this).text());
  });


}); // /ready


})(jQuery);
