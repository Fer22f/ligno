<template lang="pug">
.checkbox(@click="onClick", :class="currentClass"
@mousedown="$emit('mousedown', $event)" @mouseup="$emit('mouseup', $event)"
@mouseover="$emit('mouseover', $event)")
</template>

<script>
/* @flow */
export default {
  props: { value: Number },
  computed: {
    currentClass () {
      return this.value === -1 ? 'invalid' : this.value && 'checked'
    }
  },
  methods: {
    onClick () {
      if (this.value === -1) { return }
      this.$emit('input', +!this.value)
    }
  }
}
</script>

<style lang="sass">
$border: rgb(115, 115, 115)
$checked: rgb(91, 152, 254)

.checkbox
  :width 20px
  :height 20px
  :border solid 2px $border
  :border-radius 10%
  :position relative
  :transition background, border-color .1s cubic-bezier(.17,.84,.44,1)
  :cursor pointer
  :user-select none
  &::before
    :color #fff
    :transform rotate(45deg)
    :position absolute
    :left 4.67px
    :top 1.22px
    :width 6.67px
    :height 13.33px
    :border-width 2px
    :border-style solid
    :border-top 0
    :border-left 0
    :content ''

.checkbox.checked
  :background $checked
  :border-color $checked

.checkbox.invalid
  :border-color rgb(155, 155, 155)
  :cursor default
  &::before
    :color rgb(155, 155, 155)
    :position absolute
    :height 2px
    :width 12px
    :left 2px
    :top 7px
    :content ''
    :transform none
</style>
