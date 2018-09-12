
(function($) {

"use strict";

// Check browser support.
root.checkCompatibility();

// For dev.
//root.deleteDb();
root.createDB();

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


root.players = function() {

  // Player.

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


})();
