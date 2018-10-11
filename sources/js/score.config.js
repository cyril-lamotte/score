/**
 * @file App initialisation.
 *
 * Only the "root" variable is exposed to window's context.
 */
(function($) {

"use strict";

// Define database's name & version...
window.root = {
  app: null,
  dbName: 'score_db',
  tableName: 'config',
  dbVersion: 1,
  appVersion: '1.6.0 (11 octobre 2018)',
  appData: {}
};

})();
