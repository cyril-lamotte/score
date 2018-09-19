/**
 * @file App initialisation.
 *
 * Only the "root" variable is exposed to window's context.
 */
(function($) {

"use strict";

// Define database's name & version...
window.root = {
  dbName: 'score_db',
  tableName: 'players',
  dbVersion: 1,
  appVersion: '1.1.0 (19/09/2018)',
  appData: {}
};

})();
