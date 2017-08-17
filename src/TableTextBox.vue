<template lang="pug">
.tabletextbox
  .errinput
    textarea(:name="name", :value="value", :maxlength="maxlength",
    @input="onInput" @focus="opened = true" ref="input")
    transition(name="fade")
      .popper(ref="popper" v-if="opened",
      :style="{ top, left, width: width + 'px' }")
        text-box(:maxlength="maxlength", :multiline="true"
        ref="popperTextBox", :rows="rows" v-model="popperValue")
        .bottom
          text-button(@click="opened = false") Cancelar
          text-button(@click="save") Salvar
</template>

<script>
/* @flow */
export default {
  props: {
    name: String,
    value: { type: String, default: '' },
    maxlength: Number,
    width: Number,
    rows: Number
  },
  watch: {
    opened (value: boolean) {
      if (value) {
        this.popperValue = this.value

        this.$domBus.$emit('backdrop', true)
        this.$domBus.$on('backdrop-click', _ => {
          this.opened = false
          this.$domBus.$emit('backdrop', false)
        })

        let adjustPosition = _ => {
          const selectedRect = this.$refs.input.getBoundingClientRect()

          const realLeft = Math.min(
            selectedRect.left + 8,
            selectedRect.right - this.width + 8)

          const realTop = Math.min(
            selectedRect.top - 8,
            window.innerHeight -
              (8 + 1 + 2 + 22.8 * this.rows + 2 + 2 + 1 + 24 + 48) - 16)

          this.top = realTop + 'px'
          this.left = realLeft + 'px'
        }

        adjustPosition()
        this.$domBus.$on('scroll', adjustPosition)
        this.$domBus.$on('resize', adjustPosition)
        this.$nextTick(_ => {
          this.$refs.popperTextBox.$refs.input.focus()
        })
      } else {
        this.$domBus.$emit('backdrop', false)
        this.$domBus.$off('scroll')
        this.$domBus.$off('resize')
      }
    }
  },
  methods: {
    onInput ({ target }: window.HTMLevent) {
      this.$emit('input', target.value)
    },
    save (value: string) {
      this.$emit('input', this.popperValue)
      this.opened = false
    }
  },
  data () { return { opened: false, top: 0, left: 0, popperValue: '' } }
}
</script>

<style lang="sass">
@import 'shadows';

.tabletextbox
  > .errinput
    :margin-top 0
    > textarea
      :resize none
      :font-size 14px
      :max-height 45px

  .popper
    :position fixed
    :display flex
    :flex-flow column
    :box-shadow $whiteframe-shadow-1dp
    :z-index 100
    :overflow hidden
    :background white

  .popper > .textbox
    :flex 1
    :padding 8px
    :padding-bottom 0

  .bottom
    :justify-content flex-end

td .errinput > textarea
  :border-bottom none
</style>
