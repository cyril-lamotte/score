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
  appVersion: '1.0.1',
  env: 'prod'
};

// Determine if it's dev environnement.
if (window.location.href.indexOf('localhost') !== -1) {
  root.env = 'dev';
}

})();


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
 * Init default data or get last user's datas.
 */
root.getLastData = function() {

  var request = root.openDB();
  request.onsuccess = function(event) {

    var db = event.target.result;
    var objStore = db.transaction('players', 'readonly').objectStore('players');

    objStore.getAllKeys().onsuccess = function(event) {

      var result = event.target.result;
      var lastKey = result[result.length-1];

      // If there is already user datas, get them or init default datas.
      if (result.length) {

        // Get the last save.
        objStore.get(lastKey).onsuccess = function(event) {
          root.data_players = event.target.result;
          root.initVue();
        };

      } else {

        // Create default data.
        root.data_players = root.initData();
        root.initVue();

      }

    };

  };

};



/**
 * Create vue instance.
 */
root.mainApp = function() {

  var app = new Vue({
    el: '#app',
    data: {
      title: 'Score',
      players: root.data_players,
      modal_visible: false,
      options_visible: false,
      version: root.appVersion
    },
    computed: {
      player_count: function() {

        var c = 0;
        this.players.forEach(function(player, key) {
          if (player.visible) {
            c++;
          }
        });

        return c;
      },

      inactive_player_count: function() {

        var c = 0;
        this.players.forEach(function(player, key) {
          if (!player.visible) {
            c++;
          }
        });

        return c;
      },

    },

    mounted: function () {
      //console.log('mounted', this.title);

      if (!this.player_count) {
        this.showModal('options');
      }

    },

    updated: function () {
    },

    methods: {
      addPlayer: function() {
        this.players.push({ id: this.player_count + 1, name: 'Joueur X', score: 0, visible: true });
      },

      raz: function() {
        this.players.forEach(function(player, key) {
          player.score = 0;
        });

        // Save in indexDB.
        root.save();
      },

      showModal: function(modal_name) {

        this.modal_visible = true;

        if (modal_name == 'options') {
          this.options_visible = true;
        }

      },

      hideModal: function(modal_name) {

        this.modal_visible = false;

        if (modal_name == 'options') {
          this.options_visible = false;
        }

      },
    }
  });

};


/**
 * Check browser support.
 * Browsers need indexDB to save user's scores.
 */
root.checkCompatibility = function() {

  if (!('indexedDB' in window)) {
    alert("Attention ! Vous pouvez utiliser Score mais votre navigateur ne pourra pas sauvegarder vos parties.");
  }

};




/**
 * Define player & other_player components.
 */
root.players = function() {

  var player_template = '<div class="player" :class="{ \'player--zero-point\': player.score <= 0 }">' +
  '<div class="player__header">' +
  '  <p class="player__name" contenteditable="true" @blur="rename($event.target.innerHTML)">{{player.name}}</p>' +
  '  <p class="player__total" @click.prevent="setToZero" :class="{ \'anim-bounce\': player.update }"><button type="button" class="player__score">{{player.score}}</button></p>' +
  '</div>' +
  '<div class="player__action">' +
  '  <button type="button" @click.prevent="removePoint" class="player__update-btn btn player__update-btn--minus-1"><span class="visually-hidden">Retirer 1 point</span></button>' +
  '  <button type="button" @click.prevent="addPoint" class="player__update-btn btn player__update-btn--plus-1"><span class="visually-hidden">Ajouter 1 point</span></button>' +
  '</div>' +
  '</div>';

  Vue.component('player', {
    props: ['player'],
    template: player_template,
    methods: {

      /**
       * Rename the player.
       */
      rename: function(new_name) {
        this.player.name = new_name;
        root.save();
      },

      addPoint: function() {
        this.player.score += 1;
        this.bounce();

        // Save in indexDB.
        root.save();

      },

      removePoint: function() {
        this.player.score -= 1;
        this.bounce();

        // Save in indexDB.
        root.save();
      },

      setToZero: function() {
        this.player.score = 0;

        // Save in indexDB.
        root.save();
      },

      bounce: function() {

        this.player.update = true;

        // Remove bounce.
        //window.setTimeout(function(player) {
        //  player.update = false;
        //}, 150);

      }
    }
  });


  Vue.component('other_player', {
    props: ['player'],
    template: '<li><button type="button" @click="setVisible" class="btn">{{ player.name }}</button></li>',
    methods: {
      setVisible: function() {
        this.player.visible = !this.player.visible;
      }
    }
  });

};


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

  root.players();

  root.mainApp();

  // Add player.
  //app.players.push({ id: 4, name: 'Arnaud', score: 0, visible: false });
  //app.players[0].name = 'Cycy';

  // Update score.
  //app.players[0].score = 7;
  //app.players[1].score = 2;


};


})();
