
/**
 * Create database.
 */
app.createDB = function() {

  // Get or Create database.
  var request = app.openDB();

  request.onupgradeneeded = function(event) {

    var db = app.db = event.target.result;

    // Create Objects stores.
    var objStore = db.createObjectStore('players', { autoIncrement : true });
    var objStoreSc = db.createObjectStore('scores', { autoIncrement : true });

    // Create index.
    objStore.createIndex('by-name', 'name', { unique: true });
    objStoreSc.createIndex('by-player-id', 'playerid', { unique: true });

    // POURQUOI ? On ne passe jamais ici :
    //objStoreSc.transaction.oncomplete = function(event) {
    //};

  };

  request.onsuccess = function(event) {

    // Objects stores are created, store default data.
    app.populateObjStore('players');
    app.populateObjStore('scores');
  };

};


/**
 * Insert data
 */
app.populateObjStore = function(objName) {

  var db = app.db;

  // Create transaction.
  var trans = db.transaction(objName, 'readwrite');

  trans.oncomplete = function(event) {
    //console.log('Default ' + event.target.objectStoreNames[0] + ' inserted');
  };

  trans.onerror = function(event) {
    console.log('Transaction error.');
  };

  var objStore = trans.objectStore(objName);
  var defaultData = app.initData();

  for (var i in defaultData[objName]) {
    var requestObj = objStore.add(defaultData[objName][i]);

    requestObj.onsuccess = function() {
      //console.log('Data added for ' + objStore.name);
    };

  }

};


/**
 * Create default data.
 */
app.initData = function() {

  var defaultData = {};
  var playersData = [];
  var scoresData  = [];

  // Data for default players.
  for (var i = 1; i <= 6; i++) {
    playersData.push({ name: 'Joueur ' + i });

    // Score for default players.
    scoresData.push({
      total: i*4,
      playerid: i
    });
  }

  defaultData.players = playersData;
  defaultData.scores  = scoresData;

  return defaultData;

};



/**
 * Description
 *
 * @param {Object} name - Description
 * @param {Type} name[].name - Description
 * @returns {Type} Description
 */
app.getPlayer = function() {

  var request = indexedDB.open(app.dbName, app.dbVersion);

  request.onsuccess = function(event) {

    var db = event.target.result;

    db.transaction('players').objectStore('players').get(1).onsuccess = function(event) {
      console.log(event.target.result);
    };

  };

};




/**
 * Description
 *
 * @param {Object} name - Description
 * @param {Type} name[].name - Description
 * @returns {Type} Description
 */
app.getPlayersList = function() {

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objStore = db.transaction('players').objectStore('players');
    var objStoreSc = db.transaction('scores').objectStore('scores');

    // Browse players.
    objStore.openCursor().onsuccess = function(event) {

      var cursor = event.target.result;

      if (cursor) {
        app.insertPlayer(cursor.value, cursor.key);
        cursor.continue();
      }

    };

    db.close();

  };

};


 app.getScore = function(playerId) {

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;

    db.transaction('scores').objectStore('scores').index('by-player-id').get(playerId).onsuccess = function(event) {
      return console.log('result score:', event.target.result.total);
    };

  };

};

