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
//root.deleteDb();

// Create database.
root.createDB();

/**
 * Vue initialisation, launched by createDB() function.
 */
root.initVue = function() {

  // Player component.
  root.players();

  // Log component.
  root.logs();

  // Main component.
  root.mainApp();

};


})();
