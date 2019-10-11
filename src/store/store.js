import Vue from 'vue'
import Vuex from 'vuex'
import clock from './modules/clock'
import trade from './modules/trade'
import fund from './modules/fund'

Vue.use(Vuex);
export const store = new Vuex.Store ({
  modules: {
    clock,
    trade,
    fund,
  },
});


