<template lang="pug">
.checkdropdown
  select(:value="value" tabindex="-1", :name="name",
  :required="required", :class="{ touched }")
    option(v-for="option in options", :value="option.value")
  .inputbox(tabIndex="0" ref="selected" @click="opened = true"
  @keydown="onKeyDown")
    span.selected {{ selectedText }}
    span.arrow
  transition(name="fade")
    .popper(ref="popper" v-show="opened",
    :style="{ top, left }")
      .item(v-for="option in options" @click="onClick", v-waves
      :value="option.value", :class="[{ focus: keyboardFocusItem === option, checked: value.includes(option.value) }, 'waves-effect']")
        checkbox(:value="+value.includes(option.value)")
        slot(:text="option.text", :value="option.value")
</template>

<script>
/* @flow */
import { requiredMessage } from './UI'
import { clamp } from './services/utils'
import { currency } from './filters/numbers'

export default {
  props: {
    name: String,
    value: { type: Array, default: Array },
    required: Boolean,
    options: Array,
    row: Object
  },
  computed: {
    selectedText () {
      return currency(this.value && this.value.length > 0 &&
        this.value.map(x => this.row[x]).reduce((x, y) => x + y, 0) || 0)
    },
    keyboardFocusItem () {
      return this.options[this.keyboardFocus]
    }
  },
  data () {
    return {
      validationMessage: requiredMessage,
      touched: false,
      keyboardFocus: this.index,
      opened: false,
      left: '0',
      top: '0'
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
          let { popper, selected } = this.$refs
          let selectedRect = selected.getBoundingClientRect()

          let calculatedTop = selectedRect.top + 48 - 9
          const realTop = Math.min(Math.max(calculatedTop, 8),
            window.innerHeight -
              (48 * this.options.length) - 16)

          this.top = realTop + 'px'
          this.left = selectedRect.right - 150 + 'px'

          this.$nextTick(_ => {
            popper.scrollTop = realTop - calculatedTop
          })
        }

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
      let node = e.target
      if (!node.attributes.value) { node = node.parentNode }
      if (!node.attributes.value) { node = node.parentNode }
      let value = node.attributes.value.value
      let selected = this.value
      let index = selected.indexOf(value)
      if (index !== -1) {
        selected.splice(index, 1)
      } else {
        selected.push(value)
      }
      this.$emit('input', selected)
    },
    onKeyDown (e: window.HTMLEvent) {
      const NavigationKeys = [' ', 'Enter', 'ArrowUp', 'ArrowDown']

      this.touched = true

      if (NavigationKeys.includes(e.key) && this.opened) {
        if ([' ', 'Enter'].includes(e.key)) {
          this.selected = this.keyboardFocusItem.value
          this.opened = false
        } else {
          this.keyboardFocus = clamp(
            this.keyboardFocus + (e.key[5] === 'D' ? 1 : -1),
            0, this.options.length - 1)
          this.$nextTick(_ => {
            let { popper } = this.$refs
            let focus = popper.querySelector('.focus')

            let focusRect = focus.getBoundingClientRect()
            let popperRect = popper.getBoundingClientRect()
            let offset = focusRect.top - popperRect.top + popper.scrollTop

            if (focusRect.bottom > popperRect.bottom) {
              popper.scrollTop = offset - (200 - 48)
            } else if (popperRect.top > focusRect.top) {
              popper.scrollTop = offset
            }
          })
        }
      }

      this.opened = !['Tab', 'Escape'].includes(e.key)
    }
  }
}
</script>

<style lang="sass">
@import 'colors';
@import 'mixins';
@import 'shadows';

.checkdropdown
  :display flex
  :flex-flow column

  .label
    :font-size 14px
    :pointer-events none
    :top 24px
    :left 2px
    :position relative
    :transition 0.2s ease all
    :color $label
    :height 16px
  .label.filled
    :top 0
    :font-size 12px
    :color $main

  .inputbox:focus
    @include toggle-bar-focus

  .inputbox
    :display flex
    :flex-flow row
    :align-items center
    :height 32px
    :padding 2px
    :cursor pointer
    :outline 0

  .checked.item
    :color $main

  .popper
    :flex-direction column
    :background-color white
    :position fixed
    :box-shadow $whiteframe-shadow-1dp
    :z-index 100
    :overflow-y auto
    :width 150px

  .item, span.selected
    :display flex
    :flex-flow row
    :align-items center
    :cursor pointer
    :user-select none
    :flex 1
  .item
    :color #000

  span.selected
    :justify-content flex-end

  span.error
    :height 16px
    :padding 4px 2px
    :font-size 12px
    :color $error
    :visibility hidden

  .item
    :padding 8px
    :height 48px
    :justify-content space-between

  .item:hover, .item.focus
    :background-color $hover

  select.touched:invalid
    ~ .label
      :color $error
    ~ .box
      :border-color $error
    ~ .bar:before, ~ .bar:after
      :background $error
    ~ .error
      visibility: visible

  > select
    @include visually-hidden
</style>
