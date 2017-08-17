<template lang="pug">
.dynamiclist(@scroll="updateVisibleItems")
  .itemlist(:style="itemsStyle" ref="list")
    slot(:item="item" v-for="item in visibleItems")
</template>

<script>
export default {
  props: {
    data: Array,
    allocationSize: Number,
    estimatedLength: Number,
    itemHeight: Number,
    scrollTop: Number
  },
  methods: {
    updateVisibleItems () {
      this.$emit('scroll', this.$el.scrollTop)
      const l = Math.min(this.data.length + this.allocationSize, this.estimatedLength)
      const el = this.$el
      let scroll = {
        top: el.scrollTop,
        bottom: el.scrollTop + el.clientHeight
      }

      if (scroll.bottom >= 0 && scroll.top <= scroll.bottom) {
        let startIndex = Math.max(Math.floor(scroll.top / this.itemHeight) - 2, 0)
        let endIndex = Math.min(Math.floor(scroll.bottom / this.itemHeight) + 2, l)
        this.visibleItems = this.data.slice(startIndex, endIndex)
        this.itemContainerStyle = { height: l * this.itemHeight + 'px' }
        this.itemsStyle = {
          marginTop: startIndex * this.itemHeight + 'px',
          minHeight: (l - startIndex) * this.itemHeight + 'px'
        }

        if (endIndex > (this.data.length - 5) && this.data.length !== this.estimatedLength && !this.updateGiven) {
          this.$emit('update', this.data.length + 1)
          this.updateGiven = true
        }
      }
    }
  },
  watch: {
    data (value, oldValue) {
      this.updateVisibleItems()
      this.updateGiven = false
      if (oldValue.length > value.length) {
        this.$nextTick(_ => {
          this.$el.scrollTop = 0
        })
      }
    }
  },
  activated () {
    this.$el.scrollTop = this.scrollTop
  },
  mounted () {
    this.updateVisibleItems()
    this.$domBus.$on('scroll', this.updateVisibleItems.bind(this))
    this.$domBus.$on('resize', this.updateVisibleItems.bind(this))
    this.$el.scrollTop = this.scrollTop
  },
  data () {
    return {
      visibleItems: [],
      itemsStyle: '',
      itemContainerStyle: '',
      heightStyle: '',
      updateGiven: false
    }
  }
}
</script>

<style lang="sass">
.dynamiclist
  :display flex
  :flex-flow column
.itemlist
  :display flex
  :flex 1
  :flex-flow column
.itemlist > .item
  :min-width 0
  :white-space nowrap
  :text-overflow ellipsis
  :overflow hidden
</style>
