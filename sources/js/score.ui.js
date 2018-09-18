

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


