

/**
 * Check if browser supports IndexedDB.
 */
app.checkCompatibility = function() {

  // Check compatibility.
  if (!('indexedDB' in window)) {
    alert("Votre navigateur n'est pas compatible.");
  }

};


app.insertPlayer = function(player, playerid) {
  $('#score-table')
    .append(
      '<div data-score-player-id="' + playerid + '" class="score__row">' +
      '  <div class="score__name" contenteditable="true">' + player.name + '</div>' +
      '  <div class="score__total" id="score-player-' + playerid + '">' + player.score.total + '</div>' +
      '  <div class="score__actions">' +
      '    <button type="button" data-init="add-score-fixed" data-score-value="1">+ 1</button>' +
      '    <button type="button" data-init="add-score-fixed" data-score-value="-1">- 1</button>' +
      '    <button type="button" data-init="add-score">+</button>' +
      '  </div>' +
      '</div>'
    );
};


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
  app.currentPlayerId = parseInt($el.parents('.score__row').attr('data-score-player-id'));
};
