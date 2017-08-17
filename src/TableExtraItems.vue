<template lang="pug">
.extratextbox
  .box(@click="opened = true" ref="box")
    .total {{ value | sum(options.map(x => x.value)) | currency }}
    .arrow
  transition(name="fade")
    .popper(ref="popper" v-show="opened", :style="{ top, right }")
      .item(v-for="item in options")
        h1 {{ item.text }}
        mask-text-box(:disabled="item.disabled"
        v-model="value[item.value]" type="currency")
</template>

<script>
/* @flow */
export default {
  props: {
    name: String,
    value: { type: Object, default: Object },
    required: Boolean,
    options: Array,
    row: Array
  },
  data () {
    return {
      touched: false,
      keyboardFocus: this.index,
      opened: false,
      top: '0',
      right: '0'
    }
  },
  watch: {
    opened (value: boolean) {
      if (value) {
        this.$domBus.$emit('backdrop', true)
        this.$domBus.$on('backdrop-click', _ => {
          this.opened = false
          this.$domBus.$emit('backdrop', false)
        })

        let adjustPosition = _ => {
          let { popper, box } = this.$refs
          let selectedRect = box.getBoundingClientRect()

          let calculatedTop = selectedRect.top + 48 - 9
          const realTop = Math.min(Math.max(calculatedTop, 8),
            window.innerHeight - (48 * this.options.length) - 16)

          this.top = realTop + 'px'
          this.right = window.innerWidth - selectedRect.right + 'px'

          this.$nextTick(_ => {
            popper.scrollTop = realTop - calculatedTop
          })
        }

        this.$nextTick(_ => {
          this.$refs.popper.querySelector('input:not(:disabled)').focus()
        })

        adjustPosition()
        this.$domBus.$on('scroll', adjustPosition)
        this.$domBus.$on('resize', adjustPosition)
      } else {
        this.$domBus.$emit('backdrop', false)
        this.$domBus.$off('scroll')
        this.$domBus.$off('resize')
      }
    }
  },
  methods: {
    onClick (e: window.HTMLEvent) {
      this.$emit('input', '')
    }
  }
}
</script>

<style lang="sass">
@import 'colors';
@import 'mixins';
@import 'shadows';

.extratextbox
  :display flex
  :flex-flow row
  .box
    :cursor pointer
    :height 32px
    :display flex
    :align-items center
    :flex 1
  .total
    :flex 1
  .popper
    :position fixed
    :z-index 100
    :background white
    :box-shadow $whiteframe-shadow-2dp
  .item
    :display flex
    h1
      :font-size 14px
      :flex 1
      :background #ddd
      :margin 0
      :justify-content center
      :display flex
      :align-items center
      :padding 8px
      :color #000
    .masktextbox
      :padding 8px
      :width 130px
</style>
