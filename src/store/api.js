import axios from 'axios'

const TIMESTAMP_API = axios.create({
  baseURL: 'http://api.timezonedb.com/v2.1/',
});

const ALPHAVANTAGE_API = axios.create({
  baseURL: 'https://www.alphavantage.co/',
});

export default {
  getTime() {
    return TIMESTAMP_API.get('/get-time-zone', {
      params: {
        key: '8PDSMTWJ7XTD',
        format: 'json',
        by: 'zone',
        zone: 'America/New_York',
      }
    })
  },

  fetchStockPrice(arg) {
    return ALPHAVANTAGE_API.get('query' ,{
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: arg,
        interval: '1min',
        outputsize: 'compact',
        datatype: 'json',
        apikey: 'EFHH394V5KJFWJE2'
      }
    })
  },

  initStockPrice(arg) {
    return ALPHAVANTAGE_API.get('query' ,{
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: arg,
        outputsize: 'compact',
        datatype: 'json',
        apikey: 'YIBKJR72ZJNQZ1RD'
      }
    })
  }

}
