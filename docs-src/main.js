import Vue from 'vue'
import App from './App'
import Ligno from '../src'

Vue.use(Ligno)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
