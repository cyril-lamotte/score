
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



/**
 * Create database.
 */
root.createDB = function() {

  // Get or create database.
  var request = root.openDB();

  request.onupgradeneeded = function(event) {

    var db = root.db = event.target.result;

    // Create Objects stores.
    var objStore = db.createObjectStore('players', { autoIncrement : true });

    //objStore.createIndex('by-name', 'id', { unique: true });

    // Objects stores are created, store default data.
    objStore.transaction.oncomplete = function(event) {
      //root.save();
    };

  };

  request.onsuccess = function(event) {
    root.getLastData();
  };

};


/**
 * Save config in database.
 */
root.save = function() {

  // Connect to database.
  var request = root.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objName = 'players';

    // Create transaction.
    var trans = db.transaction(objName, 'readwrite');

    trans.oncomplete = function(event) {
    };

    trans.onerror = function(event) {
      console.log('Transaction error.');
    };

    // Add new data.
    var objStore = trans.objectStore(objName);
    var requestObj = objStore.add(root.data_players);

    requestObj.onsuccess = function() {
      //console.log('Data added for ' + objStore.name);
    };

  };

};


/**
 * Create default data.
 */
root.initData = function() {

  var defaultData = [];
  var visible  = true;


  // Data for default players.
  for (var i = 1; i <= 4; i++) {

    if (i > 2) {
      visible = false;
    }

    defaultData.push({
      'id': i,
      'name': 'Joueur ' + i,
      'score': 0,
      'visible': visible,
      'update': false
    });

  }

  return defaultData;

};


/**
 * Get last recording.
 */
root.getLastData = function() {

  var request = root.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objStore = db.transaction('players', 'readonly').objectStore('players');

    objStore.getAllKeys().onsuccess = function(event) {

      var result = event.target.result;
      var lastKey = result[result.length-1];

      if (result.length) {

        objStore.get(lastKey).onsuccess = function(event) {
          root.data_players = event.target.result;
          root.initVue();
        };

      } else {
        root.data_players = root.initData();
        root.initVue();
      }

    };

  };

};
