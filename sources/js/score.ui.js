
/**
 * Create vue instance.
 */
root.mainApp = function() {

  var app = new Vue({
    el: '#app',
    data: {
      title: root.appData.title,
      players: root.appData.players,
      score_limit: root.appData.score_limit,
      logs: [],
      winner: null,
      modal_visible: false,
      options_visible: false,
      options_filter: 'all',
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

      // If there is no player, show the options.
      if (!this.player_count) {
        this.showModal('options');
      }

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
        this.logs.push(log);
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
          app.save();

        }, 1000);

      },

      /**
       * Save config in database.
       */
      save: function() {

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
          var date = new Date();
          root.appData.date = ('0' + date.getHours()).substr(-2) + ":" + ('0' + date.getMinutes()).substr(-2) + ":" + ('0' + date.getSeconds()).substr(-2);

          var requestObj = objStore.add(root.appData);

          requestObj.onsuccess = function(event) {

            // Get last record promise.
            var last2RecordsPromise = app.getLastRecord();

            // We need to wait for the request.
            // Process once promise is resolved.
            last2RecordsPromise.then(function(last_2_records) {
              app.showDiffAndLog(last_2_records);
            });

          };

        };

      },


      /**
       * Rollback to a previous state.
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
          app.applyRecord(record);

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
       * Apply the specified record to the app.
       *
       * @param {Object} record - Specific record
       */
      applyRecord: function(record) {
        this.title = record.title;
        this.players = record.players;
        this.score_limit = record.score_limit;
      },


      getLastRecord: async function() {

        return new Promise(function(resolve, reject) {

          var request = root.openDB();
          request.onsuccess = function(event) {

            var db = event.target.result;
            var objStore = db.transaction(root.tableName, 'readonly').objectStore(root.tableName);

            objStore.count().onsuccess = function(event) {

              var count = event.target.result;
              if (count > 2) {
                objStore.getAll(IDBKeyRange.bound(count - 1, count)).onsuccess = function(event) {

                  // Add the indexedDB key to results.
                  event.target.result[0].idb_key = count - 1;
                  event.target.result[1].idb_key = count;

                  resolve(event.target.result);
                };
              }
              else {
                reject('Not enough records.');
              }

            };

          };

        });

      },


      /**
       * Evaluate difference with last save then show log.
       *
       * @param {Array} last_2_records - Array of the last two records.
       */
      showDiffAndLog: function(last_2_records) {

        var previousRecord = last_2_records[0];
        var lastRecord     = last_2_records[1];
        var diffText       = '';
        var synthesis      = '';

        //console.log('previousRecord', previousRecord);
        //console.log('lastRecord', lastRecord);


        // Check if title was updated.
        if (lastRecord.title != previousRecord.title) {
          diffText += '<span>Titre : ' + lastRecord.title + '</span>';
        }

        // Check if score limit was updated.
        if (lastRecord.score_limit != previousRecord.score_limit) {
          diffText += '<span class="log__limit">Limite passée de ' + previousRecord.score_limit + ' à <strong>' + lastRecord.score_limit + '</strong></span>';
        }

        synthesis += '<div class="log__synthesis">';
        synthesis += '<div class="log__row"><span>Limite</span><span>' + lastRecord.score_limit + '</span></div>';

        // Check if players was updated.
        if (!Object.is(lastRecord.players, previousRecord.players)) {

          // Compare scores.
          var i = 0;

          lastRecord.players.forEach(function(lastPlayer) {

            if (!lastPlayer.visible) {
              return;
            }

            var diff = 0;

            synthesis += '<div class="log__row">';
            synthesis += '<span>' + lastPlayer.name + '</span>';
            synthesis += '<span>' + lastPlayer.score + '</span>';
            synthesis += '</div>';


            previousRecord.players.forEach(function(prevPlayer) {

              if (lastPlayer.id == prevPlayer.id) {


                // Score difference.
                diff = prevPlayer.score - lastPlayer.score;

                if (diff < 0) {
                  diffText += '<span class="log__diff">' + lastPlayer.name + ' <strong>+' + Math.abs(diff) + ' point(s).</strong>' + '</span>';
                }
                else if (diff > 0) {
                  diffText += '<span class="log__diff">' + lastPlayer.name + ' <strong>-' + Math.abs(diff) + ' point(s).</strong>' + '</span>';
                }

                // Name.
                if (lastPlayer.name != prevPlayer.name) {
                  diffText += '<span class="log__rename">' + prevPlayer.name + ' renommé en <span class="log__new-name">' + lastPlayer.name + '</span>. </span>';
                }

              }

            });

            i++;

          });

        }

        synthesis += '</div>';

        diffText = '<div class="log__difftext">' + diffText + '</div>'

        // Log action.
        var log = {
          idb_key: lastRecord.idb_key,
          content: diffText + synthesis,
          date: root.appData.date
        };

        this.addLog(log);

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
