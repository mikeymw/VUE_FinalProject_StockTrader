<template>
  <div>
    <div class="container col-12 m-0 p-2">
      <div class="card">
        <img class="card-img-top" :src="stock.logo" alt="">
        <div class="card-img-overlay p-0">
          <a class="card-header d-flex flex-row px-2 py-1" @click="reroute($event)" style="cursor: pointer">
            <div class="d-flex col-5 p-0 mr-auto">{{stock.name}}</div>
            <div class="d-flex col-2 p-0 ml-auto mr-2 justify-content-end">
              <div class="d-flex flex-column px-0">
                <div class="d-flex justify-content-end">${{stock.closingPrice}}</div>
                <div class="d-flex justify-content-end">USD</div>
              </div>
            </div>
            <div class="d-flex flex-column px-0" v-if="stock.closingPrice !== 0 && stock.openingPrice !== 0">
              <div v-if="stock.closingPrice > stock.openingPrice" style="color: green">
                <i class="fa fa-plus-circle"></i>
                {{stock.closingPrice - stock.openingPrice | priceChange}}
              </div>
              <div v-else style="color: red">
                <i class="fa fa-minus-circle"></i>
                {{stock.closingPrice - stock.openingPrice | priceChange}}
              </div>
              <div v-if="stock.closingPrice > stock.openingPrice" style="color: green">
                <i class="fa fa-arrow-circle-o-up"></i>
                {{(stock.closingPrice - stock.openingPrice)/stock.openingPrice | priceChangePercent}}%
              </div>
              <div v-else style="color: red">
                <i class="fa fa-arrow-circle-o-down"></i>
                {{(stock.closingPrice - stock.openingPrice)/stock.openingPrice | priceChangePercent}}%
              </div>
            </div>
            <div v-else>--</div>
          </a>
          <div class="d-flex flex-row p-0">
            <form class="form-inline col p-0 d-flex flex-column" @submit.prevent>
              <div class="inputBox">
                <input class="form-control cardInput" :class="{'is-invalid': buyInvalid}" type="number" min="1" id="buy"
                       @keydown="validateKey($event)" v-model="buyValue" @input="validateBuy"
                       onpaste="return false" ondrop="return false">
                <div class="invalid-feedback text-center">{{invalidBuyMsg}}</div>
              </div>
              <button class="btn btn-success cardButton"
                      :class="{disabled: buyDisabled}" :disabled="buyDisabled" type="button" data-toggle="modal" data-target="#buyModal" @click="setModal('buyModal')">BUY</button>
            </form>
            <div class="form-inline col p-0 d-flex flex-column">
              <div class="cardText d-flex justify-content-center">Share Own</div>
              <div class="cardText2 d-flex justify-content-center">{{stock.share}}</div>
            </div>
            <form class="form-inline col p-0 d-flex flex-column" @submit.prevent="">
              <div class="inputBox">
                <input class="form-control cardInput" :class="{'is-invalid': sellInvalid}" type="number" min="1" id="sell"
                       @keydown="validateKey($event)" v-model="sellValue" @input="validateSell"
                       onpaste="return false" ondrop="return false">
                <div class="invalid-feedback text-center">{{invalidSellMsg}}</div>
              </div>
              <button class="btn btn-secondary cardButton"
                      :class="{disabled: sellDisabled}" :disabled="sellDisabled" type="button" data-toggle="modal" data-target="#sellModal" @click="setModal('sellModal')">SELL</button>
            </form>
          </div>
        </div>
      </div>
      <table v-if="routeName === 'stock'" class="table mt-3" style="background-color: white">
        <thead class="text-center">
        <tr>
          <th class="py-0 px-1">Order</th>
          <th class="py-0 px-1">Share</th>
          <th class="py-0 px-1">Price</th>
          <th class="py-0 px-1">Time</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="log in logs" :key="log.key">
          <th class="py-0 px-1 text-center text-truncate" scope="row">{{log.order}}</th>
          <td class="py-0 px-1 text-center text-truncate">{{log.share}}</td>
          <td class="py-0 px-1 text-center text-truncate">{{log.price}}</td>
          <td class="py-0 px-1 text-center ">{{log.time}}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="modal animated fadeIn" data-backdrop="false" :id="modalId">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 v-if="modalId === 'buyModal'">Buy In Order</h5>
            <h5 v-else>Sell Order</h5>
            <button class="close" type="button" data-dismiss="modal">&times;</button>
          </div>
          <div class="modal-body">
            <div>Stock:<span class="px-2"></span>{{stock.name}}</div>
            <div v-if="modalId === 'buyModal'">Share: <span class="px-1"></span> {{buyValue}}</div>
            <div v-else>Share: <span class="px-1"></span>{{sellValue}}</div>
            <div>Price:<span class="px-2"></span>${{logPrice}} USD</div>
          </div>
          <div class="modal-footer">
            <span>Confirm Order</span>
            <button v-if="modalId === 'buyModal'" class="btn btn-primary" type="button" data-dismiss="modal" @click="buyStock">OK</button>
            <button v-else class="btn btn-primary" type="button" data-dismiss="modal" @click="sellStock">OK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    import * as types from '../../store/types';

    export default {
        name: "stock",
        props: {
            // the stock from v-for in parents that passed into this child
            stock: {
                type: Object,
                required: true
            },
            // the closing price of a particular stock from from v-for in parents, this is used to avoid deep watch for prop: stock
            closingPrice: {
                type: Number,
                required: true
            },
            // the share of a particular stock from v-for in parents, this is used to avoid deep watch for prop: stock
            share: {
                type: Number,
                required: true
            },
            // the logs for each individual stock from v-for in parents
            logs: {
                type: Array,
                required: false
            },
            // the routeName passed from parent's $route watcher to check the route if we should display logs for the stock
            routeName: {
                type: String,
                required: false
            }
        },

        data() {
            return {
                // capture the share amount from the buy input field
                buyValue: '',
                // capture the share amount from the sell input field
                sellValue: '',
                // used to set the class is-invalid for the buy input field
                buyInvalid: false,
                // used to set the class is-invalid for the sell input field
                sellInvalid: false,
                // used to set the class disabled for the buy button
                buyDisabled: true,
                // used to set the class disabled for the sell button
                sellDisabled: true,
                // invalid feedback message for buy input field
                invalidBuyMsg: null,
                // invalid feedback message for sell input field
                invalidSellMsg: null,
                // used to set the id of the modal (either buy or sell)
                modalId: '',
                // capture the closing price when buy or sell button is pressed
                logPrice: 0,
            }
        },

        computed: {
            ...mapGetters({
                trade: types.TRADE_STATUS,
                fund: types.FUND
            }),
        },

        watch: {
            // watch closingPrice of stock so that users do not have to re-enter the amount in input field to emit an input event for validations
            closingPrice: function() {
                this.validateBuy();
                this.validateSell();
            },
            // watch trade (true/false) so that users do not have to re-enter the amount in input field to emit an input event for validations
            trade: function () {
                this.validateBuy();
                this.validateSell();
            },
            // watch funds so that users do not have to re-enter the amount in input field to emit an input event for validations
            fund: function () {
                this.validateBuy();
            },
            // watch funds so that users do not have to re-enter the amount in input field to emit an input event for validations
            share: function () {
                this.validateSell();
            }
        },

        filters: {
            'priceChange' (value) {
                return Math.abs(Math.round(value*100)/100).toFixed(2)
            },
            'priceChangePercent' (value) {
                return Math.abs(Math.round(value*1000)/100).toFixed(2)
            }
        },

        methods: {
            // prevent user from entering 'e', minus sign and dot
            validateKey(event) {
                if (event.key === 'e' || event.key === '-' || event.key === '.') {
                    event.preventDefault();
                } else {}
            },
            // validation for amount entered in buy input field
            validateBuy() {
                if (this.buyValue !== '') {
                    if (this.trade === false) {
                        this.buyInvalid = true;
                        this.buyDisabled = true;
                        this.invalidBuyMsg = 'The Market is now CLOSED!'
                    } else {
                        if (this.closingPrice === 0) {
                            this.buyInvalid = true;
                            this.buyDisabled = true;
                            this.invalidBuyMsg = 'Price updating, please be patient!'
                        } else {
                            if (parseInt(this.buyValue, 10) === 0) {
                                this.buyInvalid = true;
                                this.buyDisabled = true;
                                this.invalidBuyMsg = null
                            } else {
                                if (Math.round(parseInt(this.buyValue, 10) * this.closingPrice * 100)/100 > this.fund) {
                                    this.buyInvalid = true;
                                    this.buyDisabled = true;
                                    this.invalidBuyMsg = 'Insufficient Fund!'
                                } else {
                                    this.buyInvalid = false;
                                    this.buyDisabled = false;
                                    this.invalidBuyMsg = null
                                }
                            }
                        }
                    }
                } else {
                    this.buyInvalid = false;
                    this.buyDisabled = true;
                    this.invalidBuyMsg = null
                }
            },
            // validation for amount entered in sell input field
            validateSell() {
                if (this.sellValue !== '') {
                    if (this.trade === false) {
                        this.sellInvalid = true;
                        this.sellDisabled = true;
                        this.invalidSellMsg = 'The Market is now CLOSED!'
                    } else {
                        if (this.closingPrice === 0) {
                            this.sellInvalid = true;
                            this.sellDisabled = true;
                            this.invalidSellMsg = 'Price updating, please be patient!'
                        } else {
                            if (parseInt(this.sellValue, 10) === 0) {
                                this.sellInvalid = true;
                                this.sellDisabled = true;
                                this.invalidSellMsg = null
                            } else {
                                if (parseInt(this.sellValue, 10) > this.share) {
                                    this.sellInvalid = true;
                                    this.sellDisabled = true;
                                    this.invalidSellMsg = 'Insufficient Share!'
                                } else {
                                    this.sellInvalid = false;
                                    this.sellDisabled = false;
                                    this.invalidSellMsg = null
                                }
                            }
                        }
                    }
                } else {
                    this.sellInvalid = false;
                    this.sellDisabled = true;
                    this.invalidSellMsg = null
                }
            },
            // set the id of the modal to display either buy or sell modal fields
            // also capture the closing price of the stock at the moment of clicking buy or sell button
            setModal(arg) {
                this.modalId = arg;
                this.logPrice = this.closingPrice;
            },
            // when OK button in buy modal is pressed, update funds and emit custom event to update share and logs
            buyStock() {
                this.$store.dispatch(types.SET_FUND, -Math.round(parseInt(this.buyValue, 10) * this.logPrice * 100)/100);
                this.$emit('updateShare', this.stock.symbol, 'Buy', parseInt(this.buyValue, 10), this.logPrice);
            },
            // when OK button in buy modal is pressed, update funds and emit custom event to update share and logs
            sellStock() {
                this.$store.dispatch(types.SET_FUND, Math.round(parseInt(this.sellValue, 10) * this.logPrice * 100)/100);
                this.$emit('updateShare', this.stock.symbol, 'Sell', -parseInt(this.sellValue, 10), this.logPrice);
            },
            // user can click the header of each stock card to get into the details of a particular stock, when the user is not in that detail page
            reroute(event) {
                if (this.$route.name === 'stock') {
                    event.preventDefault()
                } else {
                    this.$router.push({path: '/stocks/' + this.stock.symbol})
                }
            },
        }
    }
</script>

<style scoped>
  .card-img-top {
    width: border-box;
    height: 70vh;
    object-fit: cover;
  }
  .cardInput {
    justify-content: center;
    display: flex;
    font-size: 30px;
    margin: 0 0 0 30px;
    padding: 0;
    height: 30px;
    width: 100px;
    flex: 0;
  }
  .cardButton {
    font-size: 20px;
    padding: 0;
    margin: 0;
    height: 50px;
    width: 80px;
    flex: 0;
  }
  .cardText {
    font-size: 25px;
    font-weight: bold;
    padding: 0;
    margin: 5px 0 160px 0;
    height: 50px;
    width: 130px;
    flex: 0;
  }
  .cardText2 {
    font-size: 25px;
    font-weight: bold;
    padding: 0;
    height: 50px;
    width: 130px;
    flex: 0;
  }
  .inputBox {
    height: 195px;
    width: 160px;
    margin: 10px 0 0 0;
  }
  .modal-backdrop {
    z-index: -1;
  }
  .modal {
    top: 20vh;
  }
</style>
