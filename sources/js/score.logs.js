
/**
 * Define log component.
 */
root.logs = function() {

  var log_template = `
  <li class="log">
    <span class="log__date">{{ log.date }}</span>
    <span v-html="log.content" class="log__content"></span>
    <button type="button" class="log__button" @click.prevent="rollback(log.idb_key)">Revenir à cet état ({{ log.idb_key }})</button>
  </li>
  `;

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

