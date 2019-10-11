<template>
    <div :style="{backgroundImage: img}" class="backgroundImg">
      <nav class="navbar sticky-top navbar-expand-xxl navbar-light bg-light p-1 opa" style="height: auto">
        <div class="container col-12 m-0 p-0">
          <div class="d-flex flex-row col-12 m-0 p-0">
            <div class="d-flex col-3 flex-column px-0 mt-1">
              <strong class="d-flex justify-content-start">Funds:</strong>
              <h5 class="d-flex mb-0 justify-content-start">${{fund | fundPrice}}</h5>
            </div>
            <div class="navbar-brand d-flex flex-column col-6 p-0">
              <router-link class="d-flex justify-content-center" :class="headerColor" to="/" exact>StockTrader (NYSE - <a v-if="clockDisplay">{{open}}</a>)</router-link>
              <small class="d-block text-center text-truncate font-weight-bold" v-if="clockDisplay">{{clock}}</small>
            </div>
            <button class="navbar-toggler ml-auto my-2 px-2" data-toggle="collapse" data-target="#links">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
          <div class="collapse navbar-collapse" id="links">
            <ul class="navbar-nav">
              <li class="nav-item dropdown" data-toggle="collapse" data-target=".navbar-collapse.show">
                <router-link class="nav-link" to="/portfolio"><a>Portfolio</a></router-link>
                <router-link class="nav-link" to="/stocks"><a>Stocks</a></router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <router-view name="home"></router-view>
      <keep-alive>
        <!--these two routes render the same component stocks.vue which needs to be kept alive as to maintain the stock data in this component-->
        <router-view name="portfolio"></router-view>
        <router-view name="stocks"></router-view>
      </keep-alive>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    import * as types from '../store/types';

    export default {
        name: "navbar",
        data(){
            return {
                // Check if clock and market open or close shall be displayed due to api call delay
                clockDisplay: false,
            }
        },

        filters: {
            // filter for fund display 2 decimal places.
            'fundPrice' (value) {
                return (Math.round(value*100)/100).toFixed(2)
            },
        },

        computed: {
            ...mapGetters ({
                clock: types.CLOCK_FULL,
                trade: types.TRADE_STATUS,
                fund: types.FUND,
            }),
            // display open or close depending on trade status
            open() {
                return (this.trade ? 'Open': 'Closed')
            },
            // attach different background image depending on trade status
            img() {
              return (this.trade ? 'url(../../background/day.jpg)': 'url(../../background/night.jpg)')
            },
            // alter header color depending on trade status
            headerColor() {
                return {
                    red: !this.trade
                }
            }
        },

        created() {
            // set clockDisplay to true after 1.5 second due to api call delay
            setTimeout(() => {this.clockDisplay = true;}, 1500)
        },
  }
</script>

<style scoped>
  .red {
    color: red;
  }
  .backgroundImg {
    opacity: 1;
    width: border-box;
    min-height: 140vh;
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center center;
  }
  .opa {
    opacity: 0.8;
  }
</style>
