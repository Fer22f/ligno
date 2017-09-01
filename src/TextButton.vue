<template lang="pug">
  button.textbutton.waves-effect(@click="onClick" v-waves, :type="type",
  :class="{ raised, 'waves-float': raised, disabled }", :disabled="disabled")
    slot
</template>

<script>
/* @flow */
export default {
  props: {
    raised: Boolean,
    type: { type: String, default: 'button' },
    disabled: Boolean
  },
  methods: {
    onClick (e: window.HTMLEvent) {
      this.$emit('click', e)

      let firstInvalid

      if (this.$el.form && this.$el.form.id) {
        firstInvalid = document.querySelector(
          `[form=${this.$el.form.id}]:invalid, #${this.$el.form.id} [form='']:invalid`)
      } else {
        firstInvalid = this.$el.querySelector(':invalid')
      }

      if (firstInvalid) { firstInvalid.focus() }
      if (!firstInvalid) { this.$emit('submit', e) }
    }
  }
}
</script>

<style lang="sass">
@import 'shadows';
@import 'colors';

$main: #26a69a

button.textbutton
  :display flex
  :flex-flow row
  :justify-content center
  :align-items center
  :border none
  :outline 0
  :background-color #FFF
  :cursor pointer
  :user-select none
  :line-height 36px
  :text-align center
  :text-transform uppercase
  :font-weight 500
  :font-family Roboto, Arial, Helvetica
  :font-size 14px
  :transition background-color .4s cubic-bezier(.25,.8,.25,1)
  :padding 0 6px

button.raised.textbutton
  :color #fff
  :background-color $main
  :letter-spacing .5px
  :border-radius 2px
  :height 36px
  :padding 0 2rem
  :transition box-shadow 0.3s cubic-bezier(.25,.8,.25,1)
  :box-shadow $whiteframe-shadow-2dp

button.textbutton.disabled
  :color rgb(153, 153, 153) !important
  :cursor default

button.textbutton::-moz-focus-inner
  :border 0

button.textbutton:not(.disabled):hover
  :background rgb(232, 232, 232)

button.raised.textbutton:not(.disabled):focus,
button.raised.textbutton:not(.disabled):hover
  :background-color blend-black($teal-500, 6%)
  :box-shadow $whiteframe-shadow-8dp
button.raised.textbutton:not(.disabled):active
  :box-shadow $whiteframe-shadow-8dp
  :background $teal-700
</style>
