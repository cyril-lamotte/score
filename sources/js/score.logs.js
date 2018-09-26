
/**
 * Define log component.
 */
root.logs = function() {

  var log_template = `
  <li class="log">{{ log.date }} : <strong v-html="log.content"></strong></li>
  `;

  Vue.component('log', {
    props: ['log'],
    template: log_template,
    computed: {
    },
    methods: {
    }

  });

};

