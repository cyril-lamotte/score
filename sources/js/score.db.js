
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
    root.getLastData();
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



/**
 * Save config in database.
 */
root.save = function() {

  // Connect to database.
  var request = root.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objName = root.tableName;

    // Create transaction.
    var trans = db.transaction(objName, 'readwrite');

    trans.onerror = function(event) {
      console.log('Transaction error.');
    };

    // Add new data.
    var objStore = trans.objectStore(objName);

    // Add curent time.
    root.appData.date = Date.now();
    var requestObj = objStore.add(root.appData);

    requestObj.onsuccess = function() {
      //console.log('Data added for ' + objStore.name);
    };

  };

};


/**
 * Create default data.
 */
root.initData = function() {

  var defaultData = {
    'title': 'Score',
    'score_limit': 0,
    'players': []
  };
  var visible  = true;


  // Data for default players.
  for (var i = 1; i <= 4; i++) {

    if (i > 2) {
      visible = false;
    }

    defaultData.players.push({
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
 * Init default data or get last user's datas.
 */
root.getLastData = function() {

  var request = root.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);

    objStore.getAllKeys().onsuccess = function(event) {

      var result = event.target.result;
      var lastKey = result[result.length-1];

      // If there is already user datas, get them or init default datas.
      if (result.length) {

        // Get the last save.
        objStore.get(lastKey).onsuccess = function(event) {
          root.appData = event.target.result;
          root.initVue();
        };

      } else {

        // Create default data.
        console.log('Default data created.');
        root.appData = root.initData();
        root.initVue();

      }

    };

  };

};
