
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

