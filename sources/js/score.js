

var data_players = [
  { id: 1, name: 'Cycy', score: 0, visible: true, update: false },
  { id: 2, name: 'Vaness', score: 0, visible: false, update: false },
  { id: 3, name: 'Nora', score: 0, visible: false, update: false },
  { id: 4, name: 'Willy', score: 0, visible: true, update: false },
  { id: 5, name: 'Daniel', score: 0, visible: false, update: false },
  { id: 6, name: 'Arlette', score: 0, visible: false, update: false },
];


// Player.

var player_template = '<div class="player" :class="{ \'player--zero-point\': player.score == 0 }">' +
'<div class="player__header">' +
'  <p class="player__name" contenteditable="true">{{player.name}}</p>' +
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
    addPoint: function() {
      this.player.score += 1;
      this.bounce();
    },
    removePoint: function() {
      this.player.score -= 1;
      this.bounce();
    },
    setToZero: function() {
      this.player.score = 0;
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
      this.player.visible = true;
    }
  }
});


// Root.
var app = new Vue({
  el: '#app',
  data: {
    title: 'Score',
    players: data_players
  },
  computed: {
    player_count: function() {
      return this.players.length;
    }
  },
  created: function () {
    // `this` est une référence à l'instance de vm
    //console.log('app created', this.title);
  },
  updated: function () {
    console.log('updated', this.title);
  },
  methods: {
    addPlayer: function() {
      this.players.push({ id: this.player_count + 1, name: 'XXX', score: 0, visible: true });
    },
  }
});



// Add player.
app.players.push({ id: 4, name: 'Arnaud', score: 0, visible: false });

// Update score.
//app.players[0].score = 7;
//app.players[1].score = 2;

