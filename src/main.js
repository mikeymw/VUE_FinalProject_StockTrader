import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {routes} from './routes'
import {store} from './store/store'
import * as types from './store/types'

Vue.use(VueRouter);
const router = new VueRouter ({
  routes,
  mode: 'history',
});

new Vue({
  el: '#app',
  router,
  store,
  created() {
    // once this vue instance is created, obtain timestamp through api call and increment timestamp every second
    this.$store.dispatch(types.GET_TIMESTAMP_ASYNC);
    this.$store.dispatch(types.TIMESTAMP_INCREMENT_ASYNC);
    // after a short delay to assure we have obtained the timestamp successfully
    // check if the market is open or closed and set trade to true or false
    setTimeout(() => {
      this.$store.dispatch(types.CHECK_CLOSING_DATE);
    }, 1500);
    setTimeout(() => {
      this.$store.dispatch(types.CHECK_TIME_ASYNC);
    }, 1500);
  },
  render: h => h(App)
});


