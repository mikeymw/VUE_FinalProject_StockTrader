<template>
    <div class="container col-12 m-0 p-1">
      <form v-if="routeName !== 'stock'" class="form-inline p-1 mx-2">
        <input type="text" class="form-control col-12" v-model="searchString" placeholder="Search Stock">
      </form>
      <ul class="list-inline" v-if="routeName === 'stocks'">
        <transition-group  appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
          <li class="list-inline-item col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 mx-0 my-1 px-1"
              v-for="stock in filteredStocks" :key="stock.key">
            <app-stock :stock="stock" :closing-price="stock.closingPrice" :share="stock.share" @updateShare="updateShare"></app-stock>
          </li>
        </transition-group>
      </ul>
      <ul class="list-inline" v-else-if="routeName === 'portfolio'">
        <transition-group  appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
          <li class="list-inline-item col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 mx-0 my-1 px-1"
              v-for="stock in profileStocks" :key="stock.name">
            <app-stock :stock="stock" :closing-price="stock.closingPrice" :share="stock.share" @updateShare="updateShare"></app-stock>
          </li>
        </transition-group>
      </ul>
      <div v-for="stock in detailStock" :key="stock.symbol">
        <router-view class="col-12 col-sm-12 col-md-10 col-lg-10 col-xl-8 mx-auto p-0 animated fadeIn"
                     :stock="stock" :closing-price="stock.closingPrice" :share="stock.share" :logs="logs[stockSymbol]" :routeName="routeName" @updateShare="updateShare">
        </router-view>
      </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    import api from '../store/api';
    import * as types from '../store/types';
    import holidays from '../store/holidays';
    import axios from 'axios';
    import stock from './children/stock.vue';

    export default {
        name: "stocks",

        components: {
            appStock: stock
        },

        data() {
            return {
                // the stock data in an array of objects format
                stocks: [
                    {name: 'Apple Inc.', symbol: 'AAPL', share: 0, openingPrice: 0, closingPrice: 0,
                        logo: '../../../Logo/apple.png', key: 1},
                    {name: 'Alphabet Inc. Class A (Google)', symbol: 'GOOGL', share: 0, openingPrice: 0, closingPrice: 0,
                        logo: '../../../Logo/google.png', key: 2},
                    {name: 'Microsoft Corporation', symbol: 'MSFT', share: 0, openingPrice: 0, closingPrice: 0,
                        logo: '../../../Logo/microsoft.png', key: 3},
                    {name: 'Facebook Inc. Class A Common Stock', symbol: 'FB', share: 1, openingPrice: 0, closingPrice: 0,
                        logo: '../../../Logo/facebook.png', key: 4},
                    {name: 'Amazon.com Inc.', symbol: 'AMZN', share: 0, openingPrice: 0, closingPrice: 0,
                        logo: '../../../Logo/amazon.png', key: 5},
                ],
                // logs for all the stocks in an object of arrays format for convenient access using key-value pair
                logs: {AAPL:[], GOOGL:[], MSFT:[], FB:[], AMZN:[]},
                // unique key for logs object, refer to method updateShare() for details of constructing this key
                logKey: 0,
                // the api array used to construct api calls for all stocks using axios.all()
                stockApiArray: [],
                // the string generated as the key for extracting price information from Alpha Vantange's Daily Series api response json objects
                priceString: '',
                // the string generated as the key for extracting price information from Alpha Vantange's Intraday Series (1min) api response json objects
                dateTimeString: '',
                // the string captured in the search bar, used to filter out the stocks array
                searchString: '',
                //capture the route name set up in route.js, used for various checks
                routeName: this.$route.name,
            }
        },
        computed: {
            ...mapGetters({
                clock: types.CLOCK_FULL,
                year: types.CLOCK_YEAR,
                month: types.CLOCK_MONTH,
                date: types.CLOCK_DATE,
                hour: types.CLOCK_HR,
                minutes: types.CLOCK_MIN,
                trade: types.TRADE_STATUS,
            }),
            // captures search keywords from search bar and generates a new filteded stocks array
            filteredStocks() {
                let str = new RegExp(this.searchString, 'i');
                return this.stocks.filter((stock) => {
                  return stock.name.match(str)
                })
            },
            // generates a new stocks array for stocks that a client owned (share !== 0) and capture search keywords in search bar
            profileStocks() {
                let str = new RegExp(this.searchString, 'i');
                return this.stocks.filter((stock) => {
                    return stock.share !== 0 && stock.name.match(str)
                })
            },
            // capture the route params (stockSymbol) set up in route.js
            stockSymbol() {
                return this.$route.params.stockSymbol;
            },
            // generate a filtered stocks array based on the route params (stockSymbol), this array will always has one element
            detailStock() {
                return this.stocks.filter((stock) => {
                    return stock.symbol.match(this.stockSymbol)
                })
            },
        },
        watch: {
            // watch the route and update the routeName for various checks
            '$route' (to, from) {
              this.routeName = to.name;
            },
            // watch getter trade to determine when shall start calling Alpha Vantage's daily(if trade === false) or intraday (1min)(if trade === true) api.
            trade: function() {
                // setTimeout is used to delay 3 secs to make sure any delay due to api calls to obtain closingPrice has been taken care of
                // check the created life cycle hook for such delay
                setTimeout(() => {
                    // when trade changes from false to true
                    if (this.trade === true) {
                        // assign the openingPrice of all stocks with it's closingPrice (as this closingPrice reflects the closingPrice of the previous trading day)
                        // you can trace starting at the created life cycle hook
                        for (let i = 0; i < this.stocks.length ; i++) {
                            this.stocks[i].openingPrice = this.stocks[i].closingPrice;
                        }
                    } else { // when trade changes from true to false
                        // call Alpha Vantage's daily series api with a delay of 1 min to make sure the daily closing prices from the api has been released before calling
                        setTimeout(() => {
                            this.constructInitApiArray();
                            this.getPrice();
                        }, 60000)
                    }
                },3000)
            },
            // watch getter minutes to call Alpha Vantage's intraday (1min) api and update closingPrice of each stocks every minute
            minutes: function() {
                if (this.trade === true) {
                    // since Alpha Vantage's api is not always updated to the current minute, extract the closing prices of the last minute instead
                    // by constructing a string of the previous minute as the key for api response json object
                    if (this.minutes === 0) {
                        this.formatDateTimeString(this.hour - 1, 59);
                    } else {
                        this.formatDateTimeString(this.hour, this.minutes - 1);
                    }
                    // construct the api calls array used for axios.all() for all stocks
                    //setTimeout(() => {
                    for (let i = 0; i < this.stockApiArray.length; i++) {
                        this.stockApiArray[i] = api.fetchStockPrice(this.stocks[i].symbol);
                    }
                    // call the promiseHandler() method to get the response array and update closingPrice every minute
                    // the argument 3 is used to identify this is case number 3, refer to getPrice() method for case number 1 & 2
                    this.promiseHandler(3);
                    //}, 60000);
                } else {}
            },
        },

        created() {
            // call Alpha Vantage's Daily Series api when the component is first created
            this.constructInitApiArray();
            // use the getPrice() method to check for cases number 1, 2 or 3 and update prices in stocks array
            // a 2 second delay is set to take into account of clock's api call delay, the constructions
            // of the priceString and dateTimeString depend on clock's api calls
            setTimeout(() => {this.getPrice()}, 2000);
        },

        methods: {
            // format hour, minutes and date
            hourMinutesDateFormat(arg) {
                if (arg < 10) {
                    return '0' + arg;
                } else return arg.toString();
            },
            // format month
            monthFormat(arg) {
                if (arg < 9) {
                    return '0' + (++arg);
                } else return (++arg).toString();
            },
            // format the dateTimeString, making it ready to be used as the key to extract price information from response json object
            formatDateTimeString(arg1, arg2) {
                this.dateTimeString = (this.year + '-' + this.monthFormat(this.month) + '-' + this.hourMinutesDateFormat(this.date) + ' ' +
                    this.hourMinutesDateFormat(arg1) + ':' + this.hourMinutesDateFormat(arg2) + ':00');
            },
            // to construct the api call arrays for Alpah Vantage's Daily Series
            constructInitApiArray() {
                for (let i = 0; i < this.stocks.length; i++) {
                    this.stockApiArray.push(api.initStockPrice(this.stocks[i].symbol));
                }
            },
            // determines which date to be put into checkDate() method as well as the case
            // please note that checkDate() method will check for and return the priceString of a trading day starting from the date we put in as argument
            getPrice() {
                // when the market is currently open, we first need to get the previous trading day's closing price to be used as today's opening price
                // this refers to case number 1 and we need to put in yesterday into checkDate() method
                // if we put today into checkDate() method, the priceString will reflect today since today is a trading day
                // however, we do not want to get today's daily closing price!
                if (this.trade === true) {
                    this.checkDate(new Date(this.clock.setDate(this.date - 1)));
                    this.promiseHandler(1);
                } else {
                    // if the market is currently closed, we have to check if the current time is before 9:30 am
                    // since today can be a trading day (however the market is now closed and the watcher for trade
                    // will call getPrice() to check again once the market open), we have to get the opening and closing
                    // price of the previous trading day, so we put in previous day into checkDate() and this case number 2
                    // will update both opening and closing prices of all stocks
                    if (this.hour <= 9) {
                        this.checkDate(new Date(this.clock.setDate(this.date - 1)));
                        this.promiseHandler(2);
                    } else {
                        // if the market is currently closed and the time is after 9:30 am, meaning today is not a trading day
                        // we put today into checkDate() and it will check for last trading day starting from today
                        this.checkDate(this.clock);
                        this.promiseHandler(2);
                    }
                }
            },
            // check the last trading day starting from the date we put in as argument
            // this method use recursion
            checkDate(arg) {
                // check for weekends
                if (arg.getDay() === 0 || arg.getDay() === 6) {
                    this.checkDate(new Date(arg.setDate(arg.getDate() - 1)));
                } else {
                    // check for full holidays, market is closed on any full holidays, refer to holidays.js
                    // please note that half holidays are trading days, refer to holidays.js
                    for (let i = 0; i < holidays.HOLIDAYS_FULL.length; i++) {
                        if (arg.toLocaleDateString() === new Date(holidays.HOLIDAYS_FULL[i]).toLocaleDateString()) {
                            this.checkDate(new Date(arg.setDate(arg.getDate() - 1)));
                            break;
                            // when loop reaches the end of full holiday list and it does not break out of the loop
                            // it means the date in the argument is not a full holiday nor weekend, it has to be a trading day
                            // set the priceString reflecting the trading day accordingly
                        } else if (i === holidays.HOLIDAYS_FULL.length - 1) {
                            return this.priceString = arg.getFullYear() + '-' + this.monthFormat(arg.getMonth()) + '-' + this.hourMinutesDateFormat(arg.getDate());
                        } else {}
                    }
                }
            },
            // handle promises with axios.all() depending on case 1, 2 or 3
            promiseHandler(arg) {
                axios.all(this.stockApiArray).then(response => {
                    // case 1 is for market is opens, assign the closingPrice to the openingPrice as the first step before closingPrice updates every minute
                    if (arg === 1) {
                        for (let i = 0; i < response.length; i++) {
                            // check if the response has 'Meta Data' representing the stock information
                            // check if the response has 'Note' for exceeding 5 calls per minute
                            // check if the specific closing price of a date or time exist
                            if (response[i].data['Meta Data'] !== undefined && !response[i].data['Note'] && response[i].data['Time Series (Daily)'][this.priceString] !== undefined) {
                                this.stocks[i].openingPrice = (Math.round(parseFloat(response[i].data['Time Series (Daily)'][this.priceString]['4. close'])*100)/100);
                            } else {}
                        }
                        // case 2 is for market is closed, get the opening and closing prices
                    } else if (arg === 2) {
                        for (let i = 0; i < response.length; i++) {
                            if (response[i].data['Meta Data'] !== undefined && !response[i].data['Note'] && response[i].data['Time Series (Daily)'][this.priceString] !== undefined) {
                                this.stocks[i].openingPrice = (Math.round(parseFloat(response[i].data['Time Series (Daily)'][this.priceString]['1. open'])*100)/100);
                                this.stocks[i].closingPrice = (Math.round(parseFloat(response[i].data['Time Series (Daily)'][this.priceString]['4. close'])*100)/100);
                            } else {}
                        }
                        // case 3 is for market is open and closingPrices update every minute
                    } else {
                        for (let i = 0; i < response.length; i++) {
                            if (response[i].data['Meta Data'] !== undefined && !response[i].data['Note'] && response[i].data['Time Series (1min)'][this.dateTimeString] !== undefined) {
                                console.log('hey'+ i);
                                this.stocks[i].closingPrice = (Math.round(parseFloat(response[i].data['Time Series (1min)'][this.dateTimeString]['4. close'])*100)/100);
                            } else {}
                        }
                    }
                }).catch(error => {
                    console.log(error)
                });
            },
            // listen to custom emitted event from stock.vue child component to update the shares after buying or selling stocks
            // also construct the logs for the corresponding stock
            updateShare(stockSymbol, order, share, price) {
                for (let i = 0; i < this.stocks.length; i++) {
                    if (this.stocks[i].symbol === stockSymbol) {
                        this.stocks[i].share += share;
                        this.logs[stockSymbol].push({order: order, share: Math.abs(share), price: price, time: this.clock, key: ++this.logKey})
                    } else {}
                }
            }
        }
    }
</script>

<style scoped>
  .zoomOut {
    position: absolute;
  }
</style>
