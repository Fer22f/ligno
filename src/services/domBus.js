/* @flow */
import Vue from 'vue'

let VueBus = new Vue()

window.addEventListener('resize', _ => {
  VueBus.$emit('resize')
})

export default VueBus
