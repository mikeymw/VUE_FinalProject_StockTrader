import * as types from '../types'
import api from '../api'

const state = {
  timeStamp: 0,
};

const getters = {
  [types.CLOCK_FULL]: (state) => {
    return new Date(state.timeStamp * 1000);
  },
  [types.CLOCK_YEAR]: (state) => {
    return new Date(state.timeStamp * 1000).getFullYear();
  },
  [types.CLOCK_MONTH]: (state) => {
    return new Date(state.timeStamp * 1000).getMonth();
  },
  [types.CLOCK_DATE]: (state) => {
    return new Date(state.timeStamp * 1000).getDate();
  },
  [types.CLOCK_HR]: (state) => {
    return new Date(state.timeStamp * 1000).getHours();
  },
  [types.CLOCK_MIN]: (state) => {
    return new Date(state.timeStamp * 1000).getMinutes();
  },
  [types.CLOCK_DAY]: (state) => {
    return new Date(state.timeStamp * 1000).getDay();
  },
  [types.CLOCK_SEC]: (state) => {
    return new Date(state.timeStamp * 1000).getMilliseconds();
  }
};

const mutations = {
  // api calls to timezoneDB to get the current timestamp for New York City
  [types.GET_TIMESTAMP_MUTATE]: (state) => {
    api.getTime().then(response => {state.timeStamp = response.data.timestamp + Math.abs(response.data.gmtOffset);})
      .catch(error => {
        console.log(error);
        state.timeStamp++;
      });
  },
  // increment the timestamp by 1 second
  [types.TIMESTAMP_INCREMENT_MUTATE]: (state) => {
    state.timeStamp++;
  }
};

const actions = {
  // call timezoneDB every minute to verify the current time of New York City, this action uses recursion
  [types.GET_TIMESTAMP_ASYNC]: ({commit, dispatch}) => {
    commit(types.GET_TIMESTAMP_MUTATE);
    setTimeout(() => {dispatch(types.GET_TIMESTAMP_ASYNC)}, 60000);
  },
  // increment the timestamp by 1 second every second, this action uses recursion
  [types.TIMESTAMP_INCREMENT_ASYNC]: ({commit, dispatch}) => {
    // for any reason that timestamp cannot be obtained successfully, call timezoneDB again after a short delay
    // then increment the timestamp by 1 second every second
    if (state.timeStamp === 0) {
      setTimeout(() => {commit(types.GET_TIMESTAMP_MUTATE);}, 300);
      setTimeout(() => {dispatch(types.TIMESTAMP_INCREMENT_ASYNC)}, 500);
    } else {
      // if the timestamp has been obtained successfully, increment the timestamp by 1 second every second
      commit(types.TIMESTAMP_INCREMENT_MUTATE);
      setTimeout(() => {dispatch(types.TIMESTAMP_INCREMENT_ASYNC)}, 1000);
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions,
}
