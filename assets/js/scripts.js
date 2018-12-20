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
  appVersion: '1.13.0',
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

  /**
   * Description
   *
   * @param {String} title - Header label
   * @param {Array} players - Player's list
   * @param {Int} score_limit - Game's score limit
   * @param {Array} logs - User's action logs
   * @param {Bool} modal_visible - Is modal visible ?
   * @param {String} options_filter - Filter which options are visible
   * @param {Bool} history_visible - Is history visible ?
   * @param {Int} total_temp - Subtotal in "add score" modal
   * @param {Int} version - App version
   */
  root.app = new Vue({
    el: '#app',
    data: {
      title: 'Score',
      players: [],
      score_limit: 0,
      logs: [],
      winner: null,
      modal_visible: false,
      options_filter: 'all',
      modal_name: null,
      history_visible: false,
      currentPlayerKey: 0,
      total_temp: 0,
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

      total_temp_label: function() {

        var label_points = ' point';
        if (this.total_temp > 1) {
          label_points += 's';
        }

        return '<span>' + this.total_temp + '</span>' + label_points + ' <span class="visually-hidden">au total</span>';
      },

      /**
       * Give tabindex related to modal state.
       */
      modal_tabindex: function() {

        if (!this.modal_visible) {
          return -1;
        }

        return 0;
      },


      /**
       * Give tabindex related to modal state.
       */
      body_tabindex: function() {

        if (this.modal_visible) {
          return -1;
        }

        return 0;
      },

    },

    created: function() {
      document.addEventListener('keyup', this.escapeKeyListener);
    },

    destroyed: function() {
      document.removeEventListener('keyup', this.escapeKeyListener);
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
       * Close modal if ESC key is pressed.
       * @param {Event} event
       */
      escapeKeyListener: function(event) {

        if (event.key == 'Escape') {
          this.hideModal('options');
        }

      },

      /**
       * Update the board title.
       */
      updateTitle: function(new_name) {

        if (this.title != new_name) {

          this.title = root.appData = new_name;

          // Save in indexDB.
          this.waitForSaving();
        }

      },


      /**
       * Add new default player.
       */
      addPlayer: function() {

        this.players.push({
          id: this.player_count + 1,
          name: 'Nouveau joueur',
          score: 0,
          visible: true,
          hasHand: false
        });

      },


      /**
       * Add new log and keep the 20 last logs.
       * @param {Object} log - Log object
       */
      addLog: function(log) {
        this.logs.unshift(log);
        this.logs = this.logs.slice(0, 20);

        return true;
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
      waitForSaving: function(options) {

        // Cancel other save.
        clearTimeout(root.time);

        root.time = setTimeout(function(options) {

          // 'this' is not available in this context.
          root.app.save(options);

        }, 2000, options);

      },


      /**
       * Save config in database & generate a log.
       */
      save: function(options = {}) {

        // Connect to database.
        var request = root.openDB();
        request.onsuccess = function(event) {

          // Add curent time.
          var date = new Date();
          root.app.$data.date = ('0' + date.getHours()).substr(-2) + ":" + ('0' + date.getMinutes()).substr(-2) + ":" + ('0' + date.getSeconds()).substr(-2);

          // Compare the last record with current datas.

          // Do not log if no_log exists.
          if (options.no_log !== true) {

            var logReadyPromise = root.app.compareCurrentStateWithLastrecord();
            logReadyPromise.then(function() {
              root.app.addRecord(event, root.tableName, root.app.$data);
            });

          } else {
            // No log is added.
            root.app.addRecord(event, root.tableName, root.app.$data);
          }

        };

      },


      /**
       * Save record in IndexedDB.
       *
       * @param {String} object_store_name - Object store name
       * @param {Any} data - Data
       */
      addRecord: function(event, object_store_name, data) {
        var db = event.target.result;
        var objStore = db.transaction(object_store_name, 'readwrite').objectStore(object_store_name);
        var requestObj = objStore.add(data);
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
              root.app.logs = last_record.logs;

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
            'update': false,
            'hasHand': (i == 1) ? true : false
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
       * Description
       *
       * @param {Object} name - Description
       * @param {Type} name[].name - Description
       * @returns {Bool} True
       */
      compareCurrentStateWithLastrecord: async function() {

        return new Promise(function(resolve, reject) {

          // Get last key promise.
          var last_key_promise = root.app.getLastKey();

          // We need to wait for the request.
          // Process once promise is resolved.
          last_key_promise.then(function(last_key) {

            if (last_key) {
              // Get the last save.
              var last_record_promise = root.app.getRecord(last_key);

              // We need to wait for the request.
              // Process once promise is resolved.
              last_record_promise.then(function(last_record) {
                root.app.showDiffAndLog(last_record);
                resolve(true);
              });

            } else {
              root.app.showDiffAndLog(false);
              resolve(true);
            }


          });

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
          diffText += '<span>Nouveau titre : ' + lastRecord.title + '</span>';
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
                    diffText += '<p class="log__rename">' + prevPlayer.name + ' renommé en <span class="log__new-name">' + lastPlayer.name + '</span>. </p>';
                  }

                  // Hand.
                  if (lastPlayer.hasHand != prevPlayer.hasHand) {

                    if (lastPlayer.hasHand) {
                      diffText += '<p class="log__rename">La main passe à <span class="log__new-name">' + lastPlayer.name + '</span>.</p>';
                    }
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
          diffText += '<p class="log__diff">' + player.name + ' <strong class="log__score">+' + Math.abs(diff) + ' point(s).</strong>' + '</p>';
        }
        else if (diff > 0) {
          diffText += '<p class="log__diff">' + player.name + ' <strong class="log__score">-' + Math.abs(diff) + ' point(s).</strong>' + '</p>';
        }

        return diffText;

      },


      /**
       * Evaluate difference with last save then show log.
       *
       * @param {Array} last_2_records - Array of the last two records.
       */
      showDiffAndLog: function(lastRecord) {

        var currentData = root.app.$data,
            synthesis,
            diffText = '';

        diffText  = this.generateDiffLog(lastRecord, currentData);
        //synthesis = this.generateLog(currentData);

        // Log action.
        var log = {
          //idb_key: currentData.idb_key,
          content: diffText, // + synthesis not displayed for now.
          date: currentData.date
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

        this.modal_name = 'modal--' + modal_name + '--' + filter;

        document.body.classList.add('modal-is-open');
        document.querySelector('.btn-close').focus();

      },


      /**
       * Hide the modal.
       *
       * @param {String} modal_name - Modal name
       */
      hideModal: function(modal_name) {

        // Scroll to the top of modal for next display.
        document.querySelector('.modal__inner').scrollTop = 0;

        this.modal_visible = false;

        document.body.classList.remove('modal-is-open');
        document.querySelector('.header__btn').focus();

      },


      /**
       * Show/hide history.
       */
      toggle_history: function() {
        this.history_visible = !this.history_visible;
      },


      /**
       * Give the hand to the next visible player.
       */
      pass_the_hand: function() {

        var nextPlayerKey = null;
        var newPlayerHasHand = false;
        var first_visible_player = null;

         // Remove the current hand.
        this.players[this.currentPlayerKey].hasHand = false;

        // Get next player key.
        this.players.forEach(function(player, key) {

          if (player.visible && !newPlayerHasHand) {

            // Save the first visible player.
            if (first_visible_player == null) {
              first_visible_player = key;
            }

            if (key > root.app.currentPlayerKey) {

              // Give the hand.
              nextPlayerKey = key;
              newPlayerHasHand = true;

            }

          }

        });

        // Save the first visible player key.
        if (!newPlayerHasHand) {
          nextPlayerKey = first_visible_player;
        }

        // Give the hand.
        this.players[nextPlayerKey].hasHand = true;
        this.currentPlayerKey = nextPlayerKey;

        this.waitForSaving();

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
       * Show confirm modal.
       *
       * @param {Object} player1 - If true, the update will apply to the
       * selected player.
       */
      show_confirm: function(player1) {
        this.showModal('options', 'confirm');

        if (!player1) {
          this.selectedPlayer = false;
        }

      },


      /**
       * Show confirm modal & set selected player.
       *
       * @param {Object} player - Current player.
       */
      show_set_score_modal: function(player) {
        this.showModal('options', 'set-score');
        this.selectedPlayer = player;
        this.total_temp = 0;
      },


      /**
       * Reset score for selected player or all player scores.
       */
      setScoreToZero: function() {

        // If there is no selected player, reset all players.
        if (this.selectedPlayer) {
          this.selectedPlayer.score = 0;
        } else {

          // Reset score & logs.
          this.raz();
          this.logs = [];
        }

        this.hideModal('options');

        // Request for a save.
        this.waitForSaving({'no_log': true});

      },


      addValueToTotal(value) {
        this.total_temp += value;
      },


      addScore(value) {

        this.selectedPlayer.score += value;

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
        this.score_limit = root.appData = parseInt(score_limit);

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

  Vue.component('player', {
    props: ['player', 'score_limit', 'tabindex'],
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
        this.$emit('set-player-score', this.player);
      },

      bounce: function() {
        this.player.update = true;
      }

    }

  });


  Vue.component('other_players', {
    props: ['player', 'tabindex', 'label'],
    template: '<li><button type="button" @click="setVisible" class="btn" v-bind:tabindex="tabindex"><span class="visually-hidden">{{ label }} </span>{{ player.name }}</button></li>',
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
    <p class="log__date">{{ log.date }}</p>
    <div v-html="log.content" class="log__content"></div>
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
