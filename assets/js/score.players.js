
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
        this.$emit('show-confirm', this.player);
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

