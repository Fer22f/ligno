<template lang="pug">
.autocomplete(ref="autocomplete", :class="{ lifted: opened }")
  .errinput
    input(:name="name", :value="value_", :required="required",
    autocomplete="off", ref="input", @blur="onBlur", @input="onInput",
    @focus="onFocus", :class="{ touched, filled: value_ || placeholder }"
    :placeholder="placeholder" @keydown="onKeyDown"
    @invalid="inputOnInvalid")
    span.bar
    label {{ label }}
      span.star(v-if="required") *
    span.helper
      span.error {{ validationMessage }}
  transition(name="fade")
    .popper(ref="popper" v-show="opened", :style="{ top, left, minWidth }")
      slot(name="notfound" v-if="!items || !items.length")
      .item(v-for="item in items" @click="onClick(item)",
      :class="{ focus: keyboardFocusItem === item }")
        slot(:item="item")
</template>

<script>
/* @flow */
import InputMixin from './InputMixin'

export default {
  mixins: [InputMixin],
  props: {
    name: String,
    label: String,
    value: Object,
    items: Array,
    itemText: String,
    placeholder: String
  },
  data () {
    return {
      value_: '',
      opened: false,
      top: '0',
      left: '0',
      minWidth: '0',
      keyboardFocusItem: null
    }
  },
  methods: {
    onInput ({ target: input }: window.HTMLEvent) {
      this.value_ = input.value
      this.$emit('update', input.value)
      if (this.value && input.value !== this.itemText) {
        this.$emit('input', null)
        this.inputOnInput(null)
      }
    },
    onFocus () {
      this.inputOnFocus()
      this.opened = true
    },
    onBlur () {
      this.inputOnBlur()
      this.opened = false
    },
    onClick (item: Object) {
      this.$emit('input', item)
      this.opened = false

      this.inputOnInput(item)
    },
    onKeyDown (e: window.HTMLEvent) {
      if (this.opened && [13, 9].includes(e.keyCode)) {
        this.$emit('input', this.keyboardFocusItem)
        this.opened = false
        if (e.keyCode === 13) { e.preventDefault() }
      }

      this.inputOnInput(this.keyboardFocusItem)
    }
  },
  watch: {
    items (items: Array<Object>) {
      if (!items) { return }
      this.opened = true

      if (this.items && this.items.length) {
        this.keyboardFocusItem = this.items[0]
      }
    },
    itemText (item: string) {
      this.value_ = item
    },
    opened (value: boolean) {
      if (value) {
        this.$domBus.$emit('backdrop', true)
        this.$domBus.$on('backdrop-click', _ => {
          this.opened = false
          this.$domBus.$emit('backdrop', false)
        })

        let { autocomplete } = this.$refs
        let adjustPosition = _ => {
          let completeRect = autocomplete.getBoundingClientRect()

          let calculatedTop = completeRect.top - 9
          let realTop = Math.max(calculatedTop, 8) + 8 + completeRect.height

          this.top = realTop + 'px'
          this.left = completeRect.left + 'px'
          this.minWidth = completeRect.width + 'px'
        }
        adjustPosition()
        this.$domBus.$on('scroll', adjustPosition)
        this.$domBus.$on('resize', adjustPosition)
      } else {
        this.$domBus.$emit('backdrop', false)
        this.$domBus.$off('scroll')
        this.$domBus.$off('resize')
      }
    },
    value (value: Object) {
      if (value === null) {
        this.keyboardFocusItem = null
      }

      this.inputOnInput(value)
    }
  }
}
</script>

<style lang="sass">
@import 'shadows';
@import 'colors';

.autocomplete
  :transition box-shadow .2s

  &.lifted
    :box-shadow $whiteframe-shadow-1dp
    :z-index 100
    :background white
    .errinput
      :z-index 100

  .popper
    :flex-direction column
    :background white
    :position fixed
    :z-index 100
    :max-height 200px
    :overflow auto
    :box-shadow $whiteframe-shadow-2dp

  .item
    :padding 8px
    :font-size 14px
    :cursor pointer
    :user-select none
  .item:hover, .item.focus
    :background $hover
</style>
