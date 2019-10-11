import * as types from '../types'

const state = {
  fund: 1000000
};

const getters = {
  [types.FUND]: (state) => {
    return state.fund;
  }
};

const mutations = {
  [types.FUND_MUTATE]: (state, payload) => {
    state.fund += payload
  }
};

const actions = {
  [types.SET_FUND]: ({commit}, payload) => {
    commit(types.FUND_MUTATE, payload)
  }
};

export default {
  state,
  getters,
  mutations,
  actions,
}
