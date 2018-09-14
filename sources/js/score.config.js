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
  dbVersion: 1,
  appVersion: '1.0.2',
  env: 'prod'
};

// Determine if it's dev environnement.
if (window.location.href.indexOf('localhost') !== -1) {
  root.env = 'dev';
}

})();
