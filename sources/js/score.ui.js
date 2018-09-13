

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
      options_visible: false
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


