/* @flow */
import Vue from 'vue'
import Waves from 'node-waves'
import 'node-waves/dist/waves.css'

Vue.directive('waves', {
  inserted (el, bind) {
    let classes = Object.keys(bind.modifiers).map(val => 'waves-' + val)
    Waves.attach(el, classes)
  }
})

Waves.init()
