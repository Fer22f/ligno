<template lang="pug">
.dropdown
  select(:value="value" tabindex="-1", :name="name"
  @invalid.prevent="onInvalid" ref="select" :required="required"
  :class="{ touched }" :form="form" :disabled="disabled" @focus="onFocus")
    option(v-for="option in options", :value="option[trackBy]")
  span.label(:class="{ filled: !!value  }") {{ label }}
    span.star(v-if="required") *
  .box(tabIndex="0" ref="selected" @click="opened = true" @blur="onBlur"
  @keydown="onKeyDown" @focus="opened = true")
    span.selected
      template(v-if="selectedItem")
        slot(:option="selectedItem")
          | {{ selectedItem.text }}
    span.arrow
  span.bar
  span.helper(v-if="!hideHelper")
    span.error {{ validationMessage }}
  transition(name="fade")
    .popper(ref="popper" v-show="opened", :style="{ minWidth, top, left }")
      .item(v-for="option in options" @click="onClick",
      :value="option[trackBy]", :class="{ focus: keyboardFocusItem === option,"
      + "selected: option[trackBy].toString() === value }")
        slot(:option="option")
          | {{ option.text }}
</template>

<script>
/* @flow */
import { requiredMessage } from './UI'
import { clamp } from './services/utils'

export default {
  props: {
    name: String,
    label: String,
    value: String,
    required: Boolean,
    options: Array,
    trackBy: { type: String, default: 'value' },
    form: String,
    hideHelper: Boolean,
    disabled: Boolean
  },
  computed: {
    index () {
      return this.value
        ? this.options.findIndex(x => x[this.trackBy].toString() === this.value)
        : 0
    },
    selectedItem () {
      return this.value &&
        this.options.find(x => x[this.trackBy].toString() === this.value)
    },
    keyboardFocusItem () {
      return this.options[this.keyboardFocus]
    },
    validationMessageDOM: {
      get () { return this.$refs.select.validationMessage },
      set (value: string) { return this.$refs.select.setCustomValidity(value) }
    }
  },
  data () {
    return {
      validationMessage: requiredMessage,
      touched: false,
      keyboardFocus: 0,
      opened: false,
      minWidth: '0',
      left: '0',
      top: '0',
      adjustPosition: null
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
          const selectedRect = selected.getBoundingClientRect()

          let calculatedTop = selectedRect.top - (this.index * 48) - 9
          let realTop = Math.max(selectedRect.top - (this.index * 48) % 200 - 9, 8)

          if (realTop > (window.innerHeight - 200 - 16)) {
            realTop = window.innerHeight - 200 - 16
          }

          this.top = realTop + 'px'
          this.left = selectedRect.left - 6 + 'px'
          this.minWidth = selectedRect.width + 16 + 'px'

          this.$nextTick(_ => {
            popper.scrollTop = realTop - calculatedTop
          })
        }

        adjustPosition()
        this.$domBus.$on('scroll', adjustPosition)
        this.$domBus.$on('resize', adjustPosition)
        this.adjustPosition = adjustPosition

        this.keyboardFocus = this.index
      } else {
        this.$domBus.$emit('backdrop', false)
        this.$domBus.$off('scroll', this.adjustPosition)
        this.$domBus.$off('resize', this.adjustPosition)
      }
    }
  },
  methods: {
    onClick (e: window.HTMLEvent) {
      this.opened = false
      this.$emit('input', e.target.attributes.value.value)
      this.validationMessageDOM = this.validationMessage = ''
    },
    onKeyDown (e: window.HTMLEvent) {
      const NavigationKeys = [' ', 'Enter', 'ArrowUp', 'ArrowDown']

      this.touched = true

      if (NavigationKeys.includes(e.key) && this.opened) {
        if ([' ', 'Enter'].includes(e.key)) {
          this.$emit('input', '' + this.keyboardFocusItem[this.trackBy])
          this.opened = false
          this.validationMessageDOM = this.validationMessage = ''
          return
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
    },
    onInvalid () {
      this.validationMessage = this.validationMessageDOM = requiredMessage
      this.touched = true
    },
    onBlur () {
      this.touched = true
    },
    onFocus () {
      this.$refs.selected.focus()
    }
  }
}
</script>

<style lang="sass">
@import 'colors';
@import 'mixins';
@import 'shadows';

.dropdown
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
    :padding-right 24px
    :user-select none
  .label.filled
    :top 0
    :font-size 12px
    :color $main

  .box:focus
    @include toggle-bar-focus

  .box
    :display flex
    :flex-flow row
    :align-items center
    :height 32px
    :padding 2px
    :cursor pointer
    :border-bottom 2px solid $inactive
    :outline 0

  .selected.item
    :color $main

  .popper
    :flex-direction column
    :background white
    :position fixed
    :z-index 100
    :max-height 200px
    :overflow auto
    :box-shadow $whiteframe-shadow-2dp

  .item, span.selected
    :display flex
    :flex-flow row
    :align-items center
    :cursor pointer
    :user-select none
    :flex 1

  span.selected
    :display block
    :white-space nowrap
    :min-width 0
    :overflow hidden
    :text-overflow ellipsis
    :word-wrap normal

  span.error
    :height 16px
    :padding 4px 2px
    :font-size 12px
    :color $error
    :visibility hidden

  .fade-enter-active, .fade-leave-active
    :transition opacity .2s

  .fade-enter, .fade-leave-to
    :opacity 0

  .item
    :padding 8px
    :height 48px

  .item:hover, .item.focus
    :background $hover

  .helper
    :height 24px

  select.touched:invalid
    ~ .label
      :color $error
    ~ .box
      :border-color $error
    ~ .bar:before, ~ .bar:after
      :background $error
    ~ .helper .error
      :visibility visible

  select:disabled
    ~ .box
      :border-bottom-color transparent
      :color rgba(0,0,0,0.38)
      :background-image linear-gradient(90deg,rgba(0,0,0,0.38) 0,rgba(0,0,0,0.38) 33%,transparent 0)
      :background-repeat repeat-x
      :background-size 4px 1px
      :background-position bottom -1px left 0
      :pointer-events none

      .arrow
        :border-top-color rgba(0,0,0,0.38)

  > select
    @include visually-hidden

</style>
