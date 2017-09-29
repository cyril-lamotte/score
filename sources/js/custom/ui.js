

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

  var total = app.getScore(playerid);

  if (total === undefined) {
    total = 0;
  }

  $('#score-table')
    .append('<div class="score__row"><div class="score__name">' + player.name + '</div><div class="score__total">' + total + '</div></div>');
};
