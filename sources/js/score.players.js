
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

        if (this.player.name != new_name) {
          this.player.name = new_name;

          // Request for a save.
          this.$emit('request-save', this.player.name + ' renommé.');
        }

      },

      /**
       * Add 1 point to the player.
       */
      addPoint: function() {
        this.player.score += 1;
        this.bounce();

        // Request for a save.
        this.$emit('request-save', '+1 point pour ' + this.player.name);

      },

      /**
       * Remove 1 point to the player.
       */
      removePoint: function() {
        this.player.score -= 1;
        this.bounce();

        // Request for a save.
        this.$emit('request-save', '-1 point pour ' + this.player.name);

      },

      setToZero: function() {
        this.player.score = 0;

        // Request for a save.
        this.$emit('request-save', 'Remise à zéro pour ' + this.player.name);

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

