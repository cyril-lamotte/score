

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
      '  <div class="score__total">' +
      '    <button type="button" class="score__btn" id="score-player-' + playerid + '">' + player.score.total + '</button>' +
      '  </div>' +
      '  <div class="score__action">' +
      '    <div class="score__action-inner">' +
      '      <button type="button" class="btn btn--plus-1" data-init="add-score-fixed" data-score-value="1">+1</button>' +
      '      <button type="button" class="btn btn--minus-1" data-init="add-score-fixed" data-score-value="-1">-1</button>' +
      '      <button type="button" class="btn btn--plus-x" data-init="add-score">+</button>' +
      '      <button type="button" class="btn btn--zero" data-init="init-score">0</button>' +
      '    </div>' +
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

  // RAZ.
  if (value == 0)
    total = 0;

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



/**
 * Display player's modal.
 */
/*app.toggleModal = function($btn) {

  // Hide modal.
  if ($('body.modal-open').length) {

    $('body').removeClass('modal-open');
    $('.score__row').removeClass('score__row--is-active');

  }
  else {
    // Show modal.

    // Add blur FX.
    $('body').addClass('modal-open');
    $btn.parents('.score__row').addClass('score__row--is-active');

  }

};*/
