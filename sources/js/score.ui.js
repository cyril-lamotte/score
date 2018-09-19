

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

      // If there is no player, show the options.
      if (!this.player_count) {
        this.showModal('options');
      }

      // Fade in.
      setTimeout(function() {
        document.querySelector('.app').classList.add('app-is-mounted');
      }, 1);

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
          root.save();
        }

      },

      /**
       * Add new default player.
       */
      addPlayer: function() {
        this.players.push({ id: this.player_count + 1, name: 'Nouveau joueur', score: 0, visible: true });
      },

      /**
       * Set all scores to zero.
       */
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
      update_score_limit: function(score_limit) {
        root.appData.score_limit = parseInt(score_limit);

        // Save in indexDB.
        root.save();
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


