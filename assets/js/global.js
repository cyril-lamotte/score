


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
    //var objStoreSc = db.transaction('scores').objectStore('scores');

    // Browse players.
    objStore.openCursor().onsuccess = function(event) {

      var cursor = event.target.result;

      if (cursor) {
        app.insertPlayer(cursor.value, cursor.key);
        cursor.continue();
      }

    };

  };

};

/*
app.getScore = function(playerId) {

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;

    db.transaction('scores').objectStore('scores').index('by-player-id').get(playerId).onsuccess = function(event) {
      return console.log('result score:', event.target.result.total);
    };

  };

};*/


/**
 * Update score for player.
 */
app.updateScoreDB = function(playerId, score) {

  playerId = parseInt(playerId);

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var store = db.transaction('players', 'readwrite').objectStore('players');

    store.get(parseInt(playerId)).onsuccess = function(event) {
      var player = event.target.result;

      player.score.total = score;

      store.put(player, playerId).onsuccess = function(event) {};

    };
  };
};



/**
 * Update score for player.
 */
app.updatePlayerName = function(name) {

  var playerId = app.currentPlayerId;

  var request = app.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var store = db.transaction('players', 'readwrite').objectStore('players');

    store.get(playerId).onsuccess = function(event) {
      var player = event.target.result;

      player.name = name;

      store.put(player, playerId).onsuccess = function(event) {};

    };

  };

};



/**
 * Launch DOM
 */
app.bddReady = function() {

  // Execute code when the DOM is fully loaded.
  $(function() {
    app.getPlayersList();
  }); // /ready

};
