

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
      '      <button type="button" class="btn btn--plus-x" data-init="add-score">&hellip;</button>' +
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
  app.bounceAnim($score);

  // Update database.
  app.updateScoreDB(app.currentPlayerId, total);

};


/**
 * Get player id in the DOM.
 */
app.setPlayerId = function($el) {

  // If a modal is open, the player id is already known.
  if ($('body').hasClass('modal-open')) {
    app.currentPlayerId = parseInt($('.score__row--is-active').attr('data-score-player-id'));
    return false;
  }

  app.currentPlayerId = parseInt($el.parents('.score__row').attr('data-score-player-id'));
};


/**
 * Show custom score form.
 */
app.showCustomScoreForm = function() {

  var $body = $('body');

  $body.on('click', 'button[data-init="add-score"]', function(event) {

    var $row = $(this).parents('.score__row');
    var rowOffset = $row.offset().top;


    // Scroll to top.
    $('body, html').animate({ scrollTop: rowOffset }, 200);

    // Disable others rows.
    $('.score__row--is-active').removeClass('score__row--is-active');

    app.toggleModal('modal-add');

    // Active row.
    $(this).parents('.score__row').addClass('score__row--is-active');

    app.setPlayerId($(this));

  });

};

app.showMenu = function() {

  var $body = $('body');

  $body.on('click', 'button[data-init="toggle-menu"]', function(event) {
    app.toggleModal('modal-menu');
  });

};


app.toggleModal = function(modalId) {

  var $body = $('body');

  // Blur background.
  $body.toggleClass('modal-open');

  // Toggle modal.
  $('#' + modalId).toggleClass('is-visible');

  if (!$body.hasClass('modal-open')) {
    // Disable rows.
    $('.score__row--is-active').removeClass('score__row--is-active');
  }
};


/**
 * Enable button for closing modals.
 */
app.closeModal = function() {

  var $body = $('body');

  $body.on('click', 'button[data-init="close-modal"]', function(event) {
    app.toggleModal($(this).parents('.modal').attr('id'));
  });

};



/**
 * Add score buttons.
 */
app.addScore = function() {

  var $body = $('body');

  $body.on('click', 'button[data-score-add-to]', function(event) {

    // Add custom value from input.
    var value = parseInt($('#add').val());
    app.updateScore(value);

  }).on('click', 'button[data-init="add-score-fixed"]', function(event) {
    event.preventDefault();

    var value = parseInt($(this).attr('data-score-value'));

    app.setPlayerId($(this));
    app.updateScore(value);

  }).on('click', 'button[data-init="init-score"]', function(event) {
    event.preventDefault();

    app.setPlayerId($(this));
    app.updateScore(0);

  });

  // Reset all scores.
  $body.on('click', 'button[data-init="init-score-all"]', function(event) {

    $('.score__row').each(function() {

      var playerId = $(this).attr('data-score-player-id');
      var $score = $(this).find('.score__btn');

      $score.text(0);
      app.bounceAnim($score);

      // Update database.
      app.updateScoreDB(playerId, 0);

    });

  });

};


/**
 * Launch "bounce" animation, then remove the class.
 *
 * @param {Object} element - DOM element
 */
app.bounceAnim = function($element) {

  $element.addClass('anim-bounce');

  window.setTimeout(function() {
    $element.removeClass('anim-bounce');
  }, 150);

};
