

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

  var playerVisibility = ' player__visible';
  if (player.hidden) {
    playerVisibility = ' player__hidden';
  }

  $('#score-table')
    .append(
      '<div data-score-player-id="' + playerid + '" class="score__row' + playerVisibility + '">' +
      '  <button type="button" class="score__remove" data-init="remove-player">Retirer</button>' +
      '  <div class="score__name" contenteditable="true">' + player.name + '</div>' +
      '  <div class="score__total">' +
      '    <button type="button" class="score__btn" data-init="add-score" id="score-player-' + playerid + '">' + player.score.total + '</button>' +
      '  </div>' +
      '  <div class="score__action">' +
      '    <div class="score__action-inner">' +
      '      <div class="action__item"><button type="button" class="btn btn--large btn--plus-1" data-init="add-score-fixed" data-score-value="1"></button></div>' +
      '      <div class="action__item"><button type="button" class="btn btn--large btn--minus-1" data-init="add-score-fixed" data-score-value="-1"></button></div>' +
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

    // Close modal.
    app.toggleModal('modal-add');

  });

  // Reset all scores.
  $body.on('click', 'button[data-init="init-score-all"]', function(event) {

    // Close modal.
    app.toggleModal('modal-menu');

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


/**
 * Add or remove players.
 */
app.managePlayers = function() {

  var $body = $('body');

  $('[data-init="remove-players"]').on('click', function (event) {
    $body.addClass('overlay-remove-players');

    // Close modal.
    app.toggleModal('modal-menu');
  });


  $body.on('click', '[data-init="remove-player"]', function (event) {
    app.setPlayerId($(this));
    app.hidePlayer();
  });

};


/**
 * Hide player.
 */
app.hidePlayer = function() {

  var $score = $('.score__row[data-score-player-id="' + app.currentPlayerId + '"');
  $score.slideUp('fast');
  app.saveHidePlayer();

};


/**
 * Update player state.
 */
app.saveHidePlayer = function() {

  var playerId = app.currentPlayerId;

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var store = db.transaction('players', 'readwrite').objectStore('players');

    store.get(parseInt(playerId)).onsuccess = function(event) {
      var player = event.target.result;

      player.hidden = true;

      store.put(player, playerId).onsuccess = function(event) {};

    };
  };
};
