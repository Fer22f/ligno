<template lang="pug">
transition(name="pop")
  .tooltip(v-if="tooltip", :style="{ left, top }")
    | {{ tooltip }}
</template>

<script>
/* @flow */
export default {
  mounted () {
    this.$domBus.$on('tooltip', ({ target, type }) => {
      if (type === 'mouseout') {
        this.tooltip = ''
      } else {
        const rect = target.getBoundingClientRect()

        this.left = rect.left + (rect.width / 2) + 'px'
        this.top = rect.bottom + 'px'

        this.tooltip = target.dataset.tooltip
      }
    })
  },
  data () {
    return {
      tooltip: '',
      left: 0,
      top: 0
    }
  }
}
</script>

<style lang="sass">
.tooltip
  :position absolute
  :background rgba(97, 97, 97, .9)
  :text-align center
  :color #fff
  :overflow hidden
  :white-space pre
  :z-index 1000
  :transition all .2s
  :font-size 12px
  :padding 4px 8px
  :border-radius 4px
  :transform translate(-50%, 6px) scale(1)
  :pointer-events none

.pop-enter-active, .pop-leave-active
  :transition all .2s cubic-bezier(.25, .8, .25, 1)

.pop-enter, .pop-leave-to
  :transform translate(-50%, -15px) scale(.6)
  :opacity 0
</style>
