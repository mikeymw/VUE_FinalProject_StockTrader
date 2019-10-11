import home from './components/home.vue'
import stocks from './components/stocks.vue'
import stock from "./components/children/stock";

export const routes = [
  {path: '', name:'home', components:{home}},
  {path: '/portfolio', name:'portfolio', components:{stocks}},
  {path: '/stocks', name:'stocks', components:{stocks}, children:[
      {path: ':stockSymbol', name:'stock', component:stock},
    ]},
  {path:'*', redirect:'/'},
];
