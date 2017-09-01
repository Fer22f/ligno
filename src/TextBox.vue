<template lang="pug">
mixin input(tag)
  #{tag}(:name="name" :value="value" :required="required"
  :disabled="disabled" :maxlength="maxlength" ref="input"
  :type="type" :autocomplete="autocomplete" @blur="inputOnBlur"
  :class="{ touched, filled: value, error: temporaryError }"
  :pattern="pattern"
  @invalid.prevent="inputOnInvalid" @input="onInput" @focus="inputOnFocus"
  @keydown="onKeyDown")&attributes(attributes)

.textbox
  .errinput(:class="!label ? 'nolabel' : ''")
    +input('input')(v-if="!multiline" @wheel.prevent)
    +input('textarea')(v-if="multiline" :rows="rows")
    span.bar
    label {{ label }}
      span.star(v-if="required") *
    span.helper(v-if="!hideHelper")
      span.error {{ validationMessage }}
      span.spacer
      span.length(v-if="maxlength")
        | {{ value && value.length || 0 }}/{{ maxlength }}
</template>

<script>
/* @flow */
import InputMixin from './InputMixin'

export default {
  name: 'text-box',
  mixins: [InputMixin],
  props: {
    value: [String, Number],
    maxlength: Number,
    type: { type: String, default: 'text' },
    autocomplete: { type: String, default: 'on' },
    multiline: Boolean,
    rows: Number,
    hideHelper: Boolean,
    pattern: String
  },
  watch: {
    value (value: String) { this.inputOnInput(value) }
  },
  methods: {
    onKeyDown (e: window.HTMLEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey ||
        !['Key', 'Digit', 'Numpad'].some(x => e.code.startsWith(x))) { return }
      if (this.type === 'number' && !/(Digit|Numpad)\d/.test(e.code)) {
        return e.preventDefault()
      }
    },
    onInput ({ target: input }: window.HTMLEvent) {
      this.inputOnInput(input.value)
      this.$emit('input', input.value)
    }
  }
}
</script>

<style lang="sass">
.textbox
  :display flex

// Chrome and Opera
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button
  :-webkit-appearance none
  :margin 0

// Firefox
input[type=number]
  :-moz-appearance textfield
  :width auto

input:disabled
  :background transparent
  :color rgba(0,0,0,0.38)
  :border-bottom-color transparent
  :background-image linear-gradient(90deg,rgba(0,0,0,0.38) 0,rgba(0,0,0,0.38) 33%,transparent 0)
  :background-repeat repeat-x
  :background-size 4px 1px
  :background-position bottom -1px left 0
</style>
