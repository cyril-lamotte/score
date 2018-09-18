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
  appVersion: '1.0.3 (18/09/2018)'
};

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
    var objStore = db.createObjectStore(root.tableName, { autoIncrement : true });

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
    var objName = root.tableName;

    // Create transaction.
    var trans = db.transaction(objName, 'readwrite');

    trans.oncomplete = function(event) {
    };

    trans.onerror = function(event) {
      console.log('Transaction error.');
    };

    // Add new data.
    var objStore = trans.objectStore(objName);
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
    'score_limit': 3,
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
        root.appData = root.initData();
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
      title: root.appData.title,
      players: root.appData.players,
      winner: null,
      modal_visible: false,
      options_visible: false,
      options_filter: 'all',
      score_limit: root.appData.score_limit,
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

      /**
       * Show the modal.
       *
       * @param {String} modal_name - Modal name
       * @param {String} filter - Modal filter to hide other options
       */
      showModal: function(modal_name, filter = 'all') {

        // This variable toggle a class if true.
        this.modal_visible = true;
        this.options_filter = filter;

        if (modal_name == 'options') {
          // This variable toggle a class if true.
          this.options_visible = true;
        }

      },

      hideModal: function(modal_name) {

        this.modal_visible = false;

        if (modal_name == 'options') {
          this.options_visible = false;
        }

      },

      show_winner: function(player) {
        this.winner = player;
        this.showModal('options', 'winner');
      },

      play_again: function() {
        this.hideModal('options');
        this.raz();
      }

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

  var player_template = `
  <div class="player" :class="{ \'player--zero-point\': player.score <= 0 }">
    <div class="player__header">
      <p class="player__name" contenteditable="true" @blur="rename($event.target.innerHTML)">{{ player.name }}</p>
      <p class="player__total" @click.prevent="setToZero" :class="{ \'anim-bounce\': player.update }"><button type="button" class="player__score">{{player.score}}</button></p>
    </div>
    <div class="player__action">
      <button type="button" @click.prevent="removePoint" class="player__update-btn btn player__update-btn--minus-1"><span class="visually-hidden">Retirer 1 point</span></button>
      <button type="button" @click.prevent="addPoint" class="player__update-btn btn player__update-btn--plus-1"><span class="visually-hidden">Ajouter 1 point</span></button>
    </div>
    <div v-if="remain != score_limit && remain > 0" class="player__remain">
      Reste <strong>{{ remain }} point(s)</strong>
    </div>
  </div>
  `;

  Vue.component('player', {
    props: ['player', 'score_limit'],
    template: player_template,
    computed: {

      /**
       * Calculate remaining point.
       */
      remain: function() {
        var c = this.score_limit - this.player.score;

        // Send winner to the app.
        if (c <= 0) {
          this.$emit('we-got-a-winner', this.player);
        }

        return c;
      }

    },
    methods: {

      /**
       * Rename the player.
       */
      rename: function(new_name) {
        this.player.name = new_name;
        root.save();
      },

      /**
       * Add 1 point to the player.
       */
      addPoint: function() {
        this.player.score += 1;
        this.bounce();

        // Save in indexDB.
        root.save();

      },

      /**
       * Remove 1 point to the player.
       */
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
