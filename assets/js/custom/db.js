
/**
 * Open database.
 */
app.openDB = function() {

  var request = indexedDB.open(app.dbName, app.dbVersion);

  request.onerror = function(event) {
    console.error(event.target.error);
  };

  request.onsuccess = function(event) {
    console.log('Request success');
  };

  return request;

};


/**
 * Delete database for a fresh start.
 */
app.deleteDb = function() {

  var deleteRq = indexedDB.deleteDatabase(app.dbName);

  deleteRq.onerror = function(event) {
    console.error('Error deleting database.');
  };

  deleteRq.onsuccess = function(event) {
    app.createDB();
  };

};
