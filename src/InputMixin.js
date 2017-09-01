import { requiredMessage } from './UI'

export default {
  props: {
    name: String,
    label: String,
    required: Boolean,
    errorMessage: String,
    errorFunction: { type: Function, default: x => null },
    focusOnMount: Boolean,
    disabled: Boolean
  },
  data () {
    return {
      validationMessage: requiredMessage,
      active: false,
      touched: false,
      // Flag for temporary error
      temporaryError: false
    }
  },
  computed: {
    validationMessageDOM: {
      get () { return this.$refs.input.validationMessage },
      set (value: string) { return this.$refs.input.setCustomValidity(value) }
    }
  },
  mounted () { this.focusOnMount && this.$refs.input.focus() },
  methods: {
    focus () { this.$refs.input.focus() },
    inputOnInput (value: Object) {
      let error = this.errorFunction(value)
      if (error) {
        this.validationMessageDOM = this.validationMessage = error
      } else if (this.required) {
        this.validationMessageDOM = this.validationMessage =
          value ? '' : requiredMessage
      }

      this.temporaryError = false
    },
    inputOnBlur () {
      this.active && (this.touched = true)
      this.active = false
    },
    inputOnFocus () {
      this.active = true
    },
    inputOnInvalid () {
      let error = this.errorFunction(this.value)
      this.validationMessageDOM = this.validationMessage =
        error || requiredMessage
      this.touched = true
    }
  },
  watch: {
    errorMessage (errorMessage: string) {
      this.validationMessage = this.validationMessageDOM = errorMessage

      // We assume the other side dispatches a single error to a single input
      if (errorMessage) { this.$refs.input.focus() }
    }
  }
}
