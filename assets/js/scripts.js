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
  appVersion: '1.6.1 (11 octobre 2018)',
  appData: {}
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


/**
 * Create vue instance.
 */
root.mainApp = function() {

  root.app = new Vue({
    el: '#app',
    data: {
      title: 'Score',
      players: [],
      score_limit: 0,
      logs: [],
      winner: null,
      modal_visible: false,
      options_visible: false,
      options_filter: 'all',
      modal_name: null,
      history_visible: false,
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

      // Get data or generate default data.
      this.getLastDataOrInit();

      // Fade in.
      setTimeout(function() {
        document.querySelector('body').classList.add('app-is-mounted');
      }, 1);

      // Check offline mode.
      window.addEventListener('online', root.updateOnlineStatus());
      window.addEventListener('offline', root.updateOnlineStatus());

    },

    updated: function () {},

    methods: {

      /**
       * Update the board title.
       */
      updateTitle: function(new_name) {

        if (this.title != new_name) {
          root.appData.title = new_name;

          // Save in indexDB.
          this.waitForSaving();
        }

      },


      /**
       * Add new default player.
       */
      addPlayer: function() {
        this.players.push({ id: this.player_count + 1, name: 'Nouveau joueur', score: 0, visible: true });
      },


      /**
       * Add new log.
       */
      addLog: function(log) {
        this.logs.unshift(log);
      },


      /**
       * Set all scores to zero.
       */
      raz: function() {

        this.players.forEach(function(player, key) {
          player.score = 0;
        });

        // Request for a save.
        this.waitForSaving();

      },


      /**
       * Delay saving.
       */
      waitForSaving: function() {

        // Cancel other save.
        clearTimeout(root.time);

        root.time = setTimeout(function() {

          // 'this' is not available in this context.
          root.app.save();

        }, 1000);

      },


      /**
       * Save config in database & generate a log.
       */
      save: function() {

        // Connect to database.
        var request = root.openDB();
        request.onsuccess = function(event) {

          var db = event.target.result;
          var objStore = db.transaction(root.tableName, 'readwrite').objectStore(root.tableName);

          // Add curent time.
          var date = new Date();
          root.app.$data.date = ('0' + date.getHours()).substr(-2) + ":" + ('0' + date.getMinutes()).substr(-2) + ":" + ('0' + date.getSeconds()).substr(-2);
          var requestObj = objStore.add(root.app.$data);

          requestObj.onsuccess = function(event) {

            // Get last records promise.
            var last2RecordsPromise = root.app.getLast2Records();

            // We need to wait for the request.
            // Process once promise is resolved.
            last2RecordsPromise.then(function(last_2_records) {

              if (last_2_records) {
                root.app.showDiffAndLog(last_2_records);
              }

            });

          };

        };

      },


      /**
       * Rollback to a previous state.
       * If no key is provided, rollback to the previous state.
       *
       * @param {Int} idb_key - Record's id.
       */
      rollback: function(idb_key) {

        // Get last record promise.
        var recordPromise = this.getRecord(idb_key);

        // We need to wait for the request.
        // Process once promise is resolved.
        recordPromise.then(function(record) {

          // Apply record.
          root.app.applyRecord(record);

          // Remove newer records.
          //root.app.removeRecord(idb_key + 1);

        });

      },


      /**
       * Get the specified record.
       *
       * @param {Int} idb_key - Record's id.
       * @returns {Promise} Record
       */
      getRecord: async function(idb_key) {

        return new Promise(function(resolve, reject) {

          var request = root.openDB();
          request.onsuccess = function(event) {

            var db = event.target.result;
            var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);

            objStore.get(idb_key).onsuccess = function(event) {
              event.target.result.idb_key = idb_key;
              resolve(event.target.result);
            };

          };

        });

      },


      /**
       * Rollback to previous record.
       */
      cancel: function() {

        var request = root.openDB();
        request.onsuccess = function(event) {

          var db = event.target.result;
          var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);

          // Get previous state key.
          objStore.getAllKeys().onsuccess = function(event) {

            var result = event.target.result;
            var currentKey  = result[result.length-1];

            // Remove current record.
            root.app.removeRecord(currentKey);

            // Remove last log.
            root.app.logs.shift();

            // Rollback to the previous record.
            if (result.length > 1) {
              var previousKey = result[result.length-2];
              root.app.rollback(previousKey);
            } else {
              // There is no previous record, so RAZ.
              root.app.raz();
            }

          };

        };

      },


      getLastKey: async function(offset = -1) {

        return new Promise(function(resolve, reject) {

          var request = root.openDB();
          request.onsuccess = function(event) {

            var db = event.target.result;
            var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);

            objStore.getAllKeys().onsuccess = function(event) {

              var result = event.target.result;

              if (result.length) {
                resolve(result[result.length + offset]);
              } else {
                resolve(false);
              }


            };

          };

        });

      },


      getLast2Keys: async function() {

        var keys = [];

        var previous_key = await root.app.getLastKey(-2);
        var current_key = await root.app.getLastKey(-1);

        if (current_key) {
          keys.push(current_key);

          // Insert de older key at the beginning of the array.
          if (previous_key) {
            keys.unshift(previous_key);
          }

        }

        return keys;
      },


      getLastDataOrInit: function() {

        // Get last key promise.
        var last_key_promise = this.getLastKey();

        // We need to wait for the request.
        // Process once promise is resolved.
        last_key_promise.then(function(last_key) {

          if (!last_key) {
            root.app.initData();
          } else {

            // Get the last save.
            var last_record_promise = root.app.getRecord(last_key);
            last_record_promise.then(function(last_record) {

              root.app.title = last_record.title;
              root.app.score_limit = last_record.score_limit;
              root.app.players = last_record.players;

            });

          }

        });

      },


      initData: function() {

        var defaultData = []
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

        this.players = defaultData;

      },


      /**
       * Apply the specified record to the app.
       *
       * @param {Object} record - Specific record
       */
      applyRecord: function(record) {
        this.title = record.title;
        this.players = record.players;
        this.score_limit = record.score_limit;
      },


      /**
       * Remove all records form idb_key to the end.
       *
       * @param {Int} idb_key - Record's id.
       */
      removeRecord: function(idb_key) {

        var request = root.openDB();
        request.onsuccess = function(event) {

          var db = event.target.result;
          var objStore = db.transaction(root.tableName, 'readwrite').objectStore(root.tableName);

          objStore.delete(IDBKeyRange.lowerBound(idb_key));

        };

      },


      /**
       * Get the two last records for comparaison.
       *
       * @returns {Promise} The 2 last records.
       */
      getLast2Records: async function() {

        return new Promise(function(resolve, reject) {

          var request = root.openDB();
          request.onsuccess = function(event) {

            // Get last two keys.
            var last_2_keys_promise = root.app.getLast2Keys();
            last_2_keys_promise.then(function(keys) {

              if (!keys.length) {
                return reject('No key stored.');
              }

              // Get last two records.
              var db = event.target.result;
              var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);
              objStore.getAll(IDBKeyRange.lowerBound(keys[0]), 2).onsuccess = function(event) {

                // Add the indexedDB key to results.
                if (event.target.result[0]) {
                  event.target.result[0].idb_key = keys[0];
                }

                if (event.target.result[1]) {
                  event.target.result[1].idb_key = keys[1];
                }

                resolve(event.target.result);
              };

            });

          };

        });

      },


      /**
       * Generate log HTML.
       *
       * @param {Object} record - A record
       */
      generateLog: function(record) {

        var synthesis = '';

        synthesis += '<div class="log__synthesis">';
        synthesis += '<div class="log__row"><span>Limite</span><span>' + record.score_limit + '</span></div>';

        record.players.forEach(function(player) {

          if (!player.visible) {
            return;
          }

          synthesis += '<div class="log__row">';
          synthesis += '  <span>' + player.name + '</span>';
          synthesis += '  <span>' + player.score + '</span>';
          synthesis += '</div>';

        });

        synthesis += '</div>';

        return synthesis;

      },


      /**
       * Generate diff log HTML.
       * previousRecord = false if there is only one record.
       *
       * @param {Object} record - A record
       */
      generateDiffLog: function(previousRecord, lastRecord) {

        var diffText = '';

        // Check if title was updated.
        if (lastRecord.title != previousRecord.title && previousRecord) {
          diffText += '<span>Titre : ' + lastRecord.title + '</span>';
        }

        // Check if score limit was updated.
        if (lastRecord.score_limit != previousRecord.score_limit && previousRecord) {
          diffText += '<span class="log__limit">Limite passée de ' + previousRecord.score_limit + ' à <strong>' + lastRecord.score_limit + '</strong></span>';
        }

        // Check if players was updated.
        if (!Object.is(lastRecord.players, previousRecord.players)) {

          // Compare scores.
          var i = 0;

          lastRecord.players.forEach(function(lastPlayer) {

            if (!lastPlayer.visible) {
              return;
            }

            if (previousRecord == false) {

              // Score difference.
              diffText += root.app.compareScore(0, lastPlayer);

            } else {

              previousRecord.players.forEach(function(prevPlayer) {

                if (lastPlayer.id == prevPlayer.id) {

                  // Score difference.
                  diffText += root.app.compareScore(prevPlayer.score, lastPlayer);

                  // Name.
                  if (lastPlayer.name != prevPlayer.name) {
                    diffText += '<span class="log__rename">' + prevPlayer.name + ' renommé en <span class="log__new-name">' + lastPlayer.name + '</span>. </span>';
                  }

                }

              });

            }

            i++;

          });

        }

        if (diffText) {
          diffText = '<div class="log__difftext">' + diffText + '</div>'
        }

        return diffText;

      },


      /**
       * Generate difference string for a player score.
       *
       * @param {Int} previousScore - Previous score
       * @param {Object} player - Player object
       * @returns {String} Difference text
       */
      compareScore: function(previousScore, player) {

        var diff = previousScore - player.score;

        var diffText = '';

        if (diff < 0) {
          diffText += '<span class="log__diff">' + player.name + ' <strong class="log__score">+' + Math.abs(diff) + ' point(s).</strong>' + '</span>';
        }
        else if (diff > 0) {
          diffText += '<span class="log__diff">' + player.name + ' <strong class="log__score">-' + Math.abs(diff) + ' point(s).</strong>' + '</span>';
        }

        return diffText;

      },


      /**
       * Evaluate difference with last save then show log.
       *
       * @param {Array} last_2_records - Array of the last two records.
       */
      showDiffAndLog: function(last_2_records) {

        var previousRecord,
            lastRecord,
            synthesis,
            diffText = '';

        // For the first record, there is no comparaison, display a simple log.
        // In this case, the first record is the last one.
        if (last_2_records.length < 2) {
          lastRecord = last_2_records[0];
          diffText  = this.generateDiffLog(false, lastRecord);
          synthesis = this.generateLog(lastRecord);
        } else {

          previousRecord = last_2_records[0];
          lastRecord     = last_2_records[1];

          // Generate diff.
          diffText  = this.generateDiffLog(previousRecord, lastRecord);
          synthesis = this.generateLog(lastRecord);

        }

        // Log action.
        var log = {
          idb_key: lastRecord.idb_key,
          content: diffText, // + synthesis not displayed for now.
          date: root.app.$data.date
        };

        if (log.content) {
          this.addLog(log);
        }

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

        this.modal_name = 'modal--' + modal_name + '--' + filter;

      },

      /**
       * Hide the modal.
       *
       * @param {String} modal_name - Modal name
       */
      hideModal: function(modal_name) {

        this.modal_visible = false;

        if (modal_name == 'options') {
          this.options_visible = false;
        }

      },


      /**
       * Show/hide history.
       */
      toggle_history: function() {
        this.history_visible = !this.history_visible;
      },


      /**
       * Show the winner screen.
       *
       * @param {Object} player - Player object.
       */
      show_winner: function(player) {

        // Do not show winner screen if there is no score limit.
        if (this.score_limit > 0) {
          this.winner = player;
          this.showModal('options', 'winner');
        }

      },


      /**
       * Show confirm modal & set selected player.
       *
       * @param {Object} player - Current player.
       */
      show_confirm: function(player) {
        this.showModal('options', 'confirm');
        this.selectedPlayer = player;
      },


      /**
       * Set selectedPlayer score to 0 or all scores to 0 if selectedPlayer
       * equals to false.
       */
      setScoreToZero: function() {

        if (this.selectedPlayer) {
          this.selectedPlayer.score = 0;
        } else {
          this.raz();
        }


        this.hideModal('options');

        // Request for a save.
        this.waitForSaving();

      },


      /**
       * Launch a new game, set all score to zero & hide modal.
       */
      play_again: function() {
        this.hideModal('options');
        this.raz();
      },

      /**
       * Define the new score limit.
       *
       * @param {Int} score_limit - New score limit
       */
      updateScoreLimit: function(score_limit) {
        this.score_limit = root.appData.score_limit = parseInt(score_limit);

        // Request for a save.
        this.waitForSaving();
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
 * Check if app is online or offline. It add the related HTML class on body.
 */
root.updateOnlineStatus = function() {

  var bodyClasses = document.querySelector('body').classList;
  var onlineClass = 'app-is-online';
  var offlineClass = 'app-is-offline';

  if (navigator.onLine) {
    bodyClasses.remove(offlineClass);
    bodyClasses.add(onlineClass);
  }
  else {
    bodyClasses.remove(onlineClass);
    bodyClasses.add(offlineClass);
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
      <p class="player__total" @click.prevent="show_confirm" :class="{ \'anim-bounce\': player.update }"><button type="button" class="player__score">{{player.score}}</button></p>
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

        if (this.player.name != new_name) {
          this.player.name = new_name;

          // Request for a save.
          this.$emit('request-save');
        }

      },

      /**
       * Add 1 point to the player.
       */
      addPoint: function() {
        this.player.score += 1;
        this.bounce();

        // Request for a save.
        this.$emit('request-save');

      },

      /**
       * Remove 1 point to the player.
       */
      removePoint: function() {
        this.player.score -= 1;
        this.bounce();

        // Request for a save.
        this.$emit('request-save');

      },

      setToZero: function() {
        this.player.score = 0;

        // Request for a save.
        this.$emit('request-save');

      },

      show_confirm: function() {
        this.$emit('show-confirm', this.player);
      },

      bounce: function() {
        this.player.update = true;
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
 * Define log component.
 */
root.logs = function() {

  var log_template = `
  <li class="log">
    <span class="log__date">{{ log.date }}</span>
    <span v-html="log.content" class="log__content"></span>
  </li>
  `;

  //     <button type="button" class="log__button" @click.prevent="rollback(log.idb_key)">Revenir à cet état ({{ log.idb_key }})</button>

  Vue.component('log', {
    props: ['log'],
    template: log_template,
    computed: {
    },
    methods: {

      /**
       * Rollback to a previous state.
       *
       * @param {Int} idb_key - Record's id.
       */
      rollback: function(idb_key) {
        this.$emit('rollback', idb_key);
      },

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

  // Player component.
  root.players();

  // Log component.
  root.logs();

  // Main component.
  root.mainApp();

};


})();
