import * as types from '../types'
import holidays from '../holidays'

const state = {
  isFullHoliday: false,
  isPartialHoliday: false,
  isWeekend: false,
  dateString: null,
  trade: false,
};

const getters = {
  [types.TRADE_STATUS]: (state) => {
    return state.trade;
  },
  [types.HOLIDAY_FULL]: (state) => {
    return state.isFullHoliday;
  },
  [types.HOLIDAY_PARTIAL]: (state) => {
    return state.isPartialHoliday;
  },
};

const mutations = {
  [types.WEEKEND_MUTATE]: (state, payload) => {
    state.isWeekend = payload;
  },
  [types.FULL_HOLIDAY_MUTATE]: (state, payload) => {
    state.isFullHoliday = payload;
  },
  [types.PARTIAL_HOLIDAY_MUTATE]: (state, payload) => {
    state.isPartialHoliday = payload;
  },
  [types.SET_DATESTRING_MUTATE]: (state, payload) => {
    state.dateString = payload;
  },
  [types.TRADE_OPEN_CLOSE_MUTATE]: (state, payload) => {
    state.trade = payload;
  }
};

const actions = {
  // this action checks whether the day when this vue instance is created is a trading day or not
  // it checks weekend, full holiday or partial holiday, refer to holiday.js
  [types.CHECK_CLOSING_DATE]: ({commit, rootState}) => {
    let date = new Date(rootState.clock.timeStamp * 1000);
    if (date.getDay() === 0 || date.getDay() === 6) {
      commit(types.WEEKEND_MUTATE, true);
      commit(types.SET_DATESTRING_MUTATE, date.toLocaleDateString());
    } else {
      commit(types.WEEKEND_MUTATE, false);
      for (let i = 0; i < holidays.HOLIDAYS_FULL.length; i++) {
        if (date.toLocaleDateString() === new Date(holidays.HOLIDAYS_FULL[i]).toLocaleDateString()) {
          commit(types.FULL_HOLIDAY_MUTATE, true);
          commit(types.SET_DATESTRING_MUTATE, date.toLocaleDateString());
          break;
        } else {
          commit(types.FULL_HOLIDAY_MUTATE, false);
          commit(types.SET_DATESTRING_MUTATE, date.toLocaleDateString());
        }
      }
      for (let j = 0; j < holidays.HOLIDAYS_PARTIAL.length; j++) {
        if (date.toLocaleDateString() === new Date(holidays.HOLIDAYS_PARTIAL[j]).toLocaleDateString()) {
          commit(types.PARTIAL_HOLIDAY_MUTATE, true);
          commit(types.SET_DATESTRING_MUTATE, date.toLocaleDateString());
          break;
        } else {
          commit(types.PARTIAL_HOLIDAY_MUTATE, false);
          commit(types.SET_DATESTRING_MUTATE, date.toLocaleDateString());
        }
      }
    }
  },
  // this action checks whether the market is open or close the time this vue instance is created
  // this action uses recursion to continuously monitor the time and date every minute - refer to last else statement and setTimeout
  [types.CHECK_TIME_ASYNC]: ({commit, state, dispatch, rootState}) => {
      let date = new Date(rootState.clock.timeStamp * 1000);
      if (date.toLocaleDateString() === state.dateString) {
        if (state.isFullHoliday === true || state.isWeekend === true) {
          commit(types.TRADE_OPEN_CLOSE_MUTATE, false);
        } else {
          if (state.isPartialHoliday === true) {
            if (date.getHours() < 9 || date.getHours() >= 13 || (date.getHours() === 9 && date.getMinutes() < 30)) {
              commit(types.TRADE_OPEN_CLOSE_MUTATE, false);
            } else {
              commit(types.TRADE_OPEN_CLOSE_MUTATE, true);
            }
          } else {
            if (date.getHours() < 9 || date.getHours() >= 16 || (date.getHours() === 9 && date.getMinutes() < 30)) {
              commit(types.TRADE_OPEN_CLOSE_MUTATE, false);
            } else {
              commit(types.TRADE_OPEN_CLOSE_MUTATE, true);
            }
          }
        }
      } else {
        dispatch(types.CHECK_CLOSING_DATE);
      }
      setTimeout(() => {dispatch(types.CHECK_TIME_ASYNC)}, 60000)
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
}


