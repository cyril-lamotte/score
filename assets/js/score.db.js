
/**
 * Create or get database.
 * Database is stored in root.db.
 * An object store "player" is created, it will store all user's datas.
 * After creation, we init default data or get last user's datas.
 */
root.createDB = function() {

  // Get or create database.
  var request = root.openDB();

  request.onupgradeneeded = function(event) {

    var db = root.db = event.target.result;

    // Create Objects stores.
    var objStore = db.createObjectStore(root.tableName, { autoIncrement : true });

  };

  request.onsuccess = function(event) {
    root.initVue();
  };

};


/**
 * Open database.
 */
root.openDB = function() {

  var request = indexedDB.open(root.dbName, root.dbVersion);

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
root.deleteDb = function() {

  var deleteRq = indexedDB.deleteDatabase(root.dbName);

  deleteRq.onerror = function(event) {
    console.error('Error deleting database.');
  };

  deleteRq.onsuccess = function(event) {
    console.log('Database deleted.');
  };

};
