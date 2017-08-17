<template lang="pug">
.boletotextbox
  .errinput(:class="!label && 'nolabel'")
    input.touched(:name="name", :value="formattedValue", :required="required",
    :disabled="disabled", ref="input", autocomplete="off", @blur="onBlur",
    :class="{ filled: textValue !== '', error }" @invalid.prevent="onInvalid"
    @input="onInput" @focus="active = true" @keydown="onKeyDown",
    :maxlength="maxLength")
    span.bar
    label {{ label }}
      span.star(v-if="required") *
    span.helper
      span.error {{ validationMessage }}
</template>

<script>
/* @flow */
import { requiredMessage } from './UI'
import { getCaret, setCaret } from './services/mask'

const mod10 = num => {
  let rest = [...num].reverse().reduce(({sum, factor}, character) => ({
    sum: sum + [...(character * factor).toString()].map(Number).reduce((x, y) => x + y),
    factor: factor === 2 ? 1 : 2
  }), { sum: 0, factor: 2 }).sum % 10
  return rest === 0 ? 0 : (10 - rest)
}

const mod11 = (num, base = 9, r = 0) => {
  const radixFn = r === 0 ? x => x * 10 % 11 % 10 : x => x % 11
  return radixFn([...num].reverse().reduce(({sum, factor}, character) => ({
    sum: sum + (character * factor),
    factor: factor === base ? 2 : factor + 1
  }), { sum: 0, factor: 2 }).sum)
}

const patternBank = '_____._____ _____.______ _____.______ _ ______________'
const patternGovernment = '___________-_ ___________-_ ___________-_ ___________-_'
const isGovernment = code => code.slice(0, 1) === '8'

const patternApply = value => {
  const pattern = isGovernment(value) ? patternGovernment : patternBank
  let i = 0
  let j = 0
  let formattedValue = ''
  while (i < value.length && j < pattern.length) {
    if (pattern[j] === '_') {
      formattedValue += value[i]
      i++
    } else {
      formattedValue += pattern[j]
    }
    j++
  }
  return formattedValue
}

export default {
  props: {
    name: String,
    label: String,
    value: [String, Number],
    required: Boolean,
    disabled: Boolean,
    errorMessage: String,
    focus: Boolean,
    type: { type: String },
    autocomplete: { type: String, default: 'on' }
  },
  data () {
    return {
      validationMessage: requiredMessage,
      touched: false,
      active: false,
      // Flag for temporary error
      error: false,
      code: null,
      textValue: this.value || ''
    }
  },
  watch: {
    errorMessage (errorMessage: string) {
      this.error = true
      this.validationMessage = errorMessage

      // We assume the other side dispatches a single error to a single input
      this.$refs.input.focus()
    }
  },
  computed: {
    validationMessageDOM: {
      get () { return this.$refs.input.validationMessage },
      set (value: string) { return this.$refs.input.setCustomValidity(value) }
    },
    formattedValue () {
      return patternApply(this.textValue)
    },
    maxLength () {
      return isGovernment(this.formattedValue) ? 55 : 54
    }
  },
  mounted () { this.focus && this.$refs.input.focus() },
  methods: {
    onInput ({ target: input } : window.HTMLEvent) {
      let pos = getCaret(input, input.value)
      const numbersOnly = [...input.value].filter(ch => /\d/.test(ch)).join('')
      this.textValue = numbersOnly

      this.error = false

      const errorMatrix = isGovernment(numbersOnly)
        ? [[0, 11], [12, 23], [24, 35], [36, 47]] : [[0, 9], [10, 20], [21, 31]]
      const modFn = isGovernment(numbersOnly) && numbersOnly.slice(0, 2) !== '83' ? mod11 : mod10

      const errors = errorMatrix
        .map(([start, end], index) => [index + 1, start, end])
        .filter(([index, start, end]) => numbersOnly.length > end &&
          modFn(numbersOnly.slice(start, end)) !== +numbersOnly[end])
        .map(([index, start, end]) => index)

      if (errors.length) {
        this.error = true
        this.validationMessage = 'Erro de digitação ' +
          (errors.length === 1 ? 'no campo ' : 'nos campos ') +
          errors.slice(0, -1).join(', ') +
          (errors.length > 1 ? ' e ' : '') + errors.slice(-1)[0]
      }

      if (!isGovernment(numbersOnly) && numbersOnly.length === 47) {
        const barcode = numbersOnly.slice(0, 4) + numbersOnly.slice(33) +
          numbersOnly.slice(4, 9) + numbersOnly.slice(10, 20) +
          numbersOnly.slice(21, 31)
        const mod = mod11(barcode, 9, 1)
        const dv = (mod === 0 || mod === 1 || mod === 10) ? 1 : 11 - mod
        if (dv !== +numbersOnly[32]) {
          this.error = true
          this.validationMessage = 'Código de barras inválido'
        }
      }

      const pattern = isGovernment(numbersOnly) ? patternGovernment : patternBank
      const patterned = patternApply(numbersOnly)

      if (!this.error && patterned.length === pattern.length) {
        this.$emit('input', numbersOnly)
      } else {
        this.$emit('input', '')
      }

      if (patterned.length > input.value.length && pos === input.value.length) {
        pos = patterned.length
      } else if (pattern[pos - 1] !== '_' && patterned.length > input.value.length) {
        pos += 1
      }

      this.$nextTick(_ => setCaret(input, pos))
    },
    onBlur () {
      this.active && (this.touched = true)
      this.active = false
    },
    onInvalid () {
      this.validationMessageDOM = requiredMessage
      this.validationMessage = requiredMessage
      this.touched = true
    },
    onKeyDown (e: window.HTMLEvent) {
      this.code = e.keyCode

      if (e.altKey || e.ctrlKey || e.metaKey ||
        !['Key', 'Digit', 'Numpad'].some(x => e.code.startsWith(x))) { return }
      if (!/\d/.test(e.key)) { return e.preventDefault() }
    }
  }
}
</script>

<style lang="sass">
.boletotextbox
  input
    :font-size 20px
</style>
