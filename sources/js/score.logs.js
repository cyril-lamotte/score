
/**
 * Define log component.
 */
root.logs = function() {

  var log_template = `
  <li class="log">{{ log.date }} : <strong>{{ log.content }}</strong></li>
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

