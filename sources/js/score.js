/**
 * @file Main js file.
 *
 * Create Vue instance & components.
 */

(function($) {

"use strict";

// Check browser support.
root.checkCompatibility();

// Delete database for testing.
// root.deleteDb();

// Create database.
root.createDB();


/**
 * Vue initialisation, launched by createDB() function.
 */
root.initVue = function() {

  root.players();

  root.mainApp();

  // Add player.
  //app.players.push({ id: 4, name: 'Arnaud', score: 0, visible: false });
  //app.players[0].name = 'Cycy';

  // Update score.
  //app.players[0].score = 7;
  //app.players[1].score = 2;


};


})();
