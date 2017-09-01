<template lang="pug">
.masktextbox
  .errinput(:class="!label && 'nolabel'")
    input(:name="name" :value="formattedValue" :required="required"
    :disabled="disabled" ref="input" autocomplete="off" @blur="inputOnBlur"
    :class="{ touched, filled: value !== '', error: temporaryError }"
    @invalid.prevent="inputOnInvalid"
    @input="onInput" @focus="inputOnFocus" @keydown="onKeyDown")
    span.bar
    label {{ label }}
      span.star(v-if="required") *
    span.helper
      span.error {{ validationMessage }}
</template>

<script>
/* @flow */
import { currency } from './filters/numbers'
import { getCaret, setCaret } from './services/mask'
import InputMixin from './InputMixin'

export default {
  mixins: [InputMixin],
  props: {
    value: [String, Number],
    type: String
  },
  computed: {
    formattedValue () { return this.value ? currency(this.value) : 'R$ 0,00' }
  },
  methods: {
    onInput ({ target: input } : window.HTMLEvent) {
      let pos = getCaret(input, this.formattedValue)

      let numberPosition =
        (+input.value.slice(0, pos).replace(/[^\d]/g, '')).toString().length - 1

      let numbers
      let formatted
      if (this.type === 'currency') {
        numbers = input.value.replace(/[^\d]/g, '')
        formatted = +numbers ? currency(+numbers / 100) : 'R$ 0,00'
        if (this.value === 0) {
          numbers = numbers.replace(/0/g, '')
          pos = formatted.length
        } else {
          let i = -1
          let leadingZero = true
          let j = 0
          while (j <= numberPosition) {
            i += 1
            if (formatted[i] < '0' || formatted[i] > '9' ||
              (formatted[i] === '0' && leadingZero)) {
              continue
            }
            j += 1
            leadingZero = false
          }

          if (this.value === 0) {
            pos = formatted.length
          } else {
            pos = i + 1
          }
        }

        this.$emit('input', +numbers / 100)
        this.inputOnInput(+numbers / 100)

        input.value = this.formattedValue
      }

      this.$nextTick(_ => setCaret(input, pos))
    },
    onKeyDown (e: window.HTMLEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey ||
        !['Key', 'Digit', 'Numpad'].some(x => e.code.startsWith(x))) { return }
      if (!/(Digit|Numpad)\d/.test(e.code)) { return e.preventDefault() }
    }
  }
}
</script>
