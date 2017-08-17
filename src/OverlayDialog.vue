<template lang="pug">
form.dialog-container(
  @submit.prevent="ok", :class="active ? 'active' : ''" ref="form")
  .dialog
    slot(name="question")
  .bottom
    slot(name="answer", :cancel="cancel")
</template>

<script>
/* @flow */
import { pick } from './services/utils'

export default {
  props: {
    active: [Boolean, window.HTMLElement]
  },
  computed: {
    box () {
      return this.active
        ? pick(this.active.getBoundingClientRect(), ['left', 'top', 'width', 'height']) : {}
    }
  },
  watch: {
    active (value: boolean) {
      if (value) {
        this.$domBus.$emit('backdrop', ['overlay'])
        this.$domBus.$on('backdrop-click', _ => {
          this.$emit('action', { ok: false })
        })
      } else {
        this.$domBus.$emit('backdrop', false)
      }
    }
  },
  methods: {
    ok () {
      this.$emit('action', { ok: true, form: this.$refs.form })
    },
    cancel () {
      this.$emit('action', { ok: false })
    }
  }
}
</script>

<style lang="sass">
@import "shadows";

.dialog-container.active
  :display flex
.dialog-container
  :display none
  :position fixed
  :top 50%
  :left 50%
  :transform translate(-50%, -50%)
  :z-index 3000
  :background #fff
  :box-shadow $whiteframe-shadow-24dp
  :flex-flow column

  .bottom
    :justify-content flex-end

.dialog
  :padding 24px
  :flex 1
  :display flex
  :flex-flow column

  > h1
    :margin 0
    :margin-bottom 20px
    :font-family 'Roboto', sans-serif
    :font-size 20px
    :font-weight 500

.overlay
  :opacity .48
  :background rgb(33, 33, 33)
</style>
