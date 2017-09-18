<template lang="pug">
.datatable
  table.thead(:style="{ width: value.length ? 'auto' : '' }")
    thead(ref="thead")
      tr
        th.checkbox-cell(v-if="selectionMode")
          checkbox(v-model="selectedAll")
          div(:style="{ width: headersWidth[0], margin: '0 -16px' }")
        th(v-for="(column, i) in columns",
        :data-tooltip="column.tooltip",
        :class="[column.type, { sortable: column.sort }]"
        @mouseout="$tooltip" @mouseover="$tooltip"
        @click="column.sort && onColumnClick($event, column.sort)")
          span.sortarrow(v-if="column.type === 'num' &&" +
          "currentSort.replace('-', '') === column.sort",
          :class="currentSort[0] === '-' && 'inverted'")
          span {{ column.name }}
          span.sortarrow(v-if="column.type !== 'num' &&" +
          "currentSort.replace('-', '') === column.sort",
          :class="currentSort[0] === '-' && 'inverted'")
          div(:style="{ width: headersWidth[i+1], margin: '0 -8px' }")
        th.arrow-cell(v-if="$scopedSlots.expand")
      transition(name="vanish")
        .progress(v-show="progress")
          .indeterminate
  .tbody-container(@scroll="onScroll" ref="scrollContainer")
    table(@mouseup="onMouseUp")
      thead
        tr.hidden-row
          th.checkbox-cell(v-if="selectionMode")
          th(v-for="column in columns")
            span {{ column.name }}
            span.sortarrow(v-if="currentSort.replace('-', '') === column.sort")
          th.arrow-cell(v-if="$scopedSlots.expand")
      tbody(ref="tbody")
        tr.filler(:style="topItemStyle")
        template(v-for="(row, index) in visibleItems")
          tr(:class="[{ checked: row.state_ === 1, " +
          "clickable: $scopedSlots.expand }, classList(row)]"
          @click="onRowClick($event, row)")
            td.checkbox-cell(@click.stop v-if="selectionMode")
              checkbox(:value="row.state_" @mouseup="onMouseUp"
              @mousedown.prevent="onMouseDown($event, row, index)"
              @mouseover="onMouseOver($event, row)")
            slot(:row="row")
            td(v-if="$scopedSlots.expand").arrow-cell
              .arrow.down(:class="expandedRow === row && 'inverted'")
          tr(v-if="expandedRow === row").expando
            slot(:row="row" name="expand")
        tr.filler(:style="bottomItemStyle")
</template>

<script>
/* @flow */
export default {
  props: {
    value: { type: Array, default: Array },
    columns: Array,
    trackBy: [String, Function],
    classList: { type: Function, default: (_: any) => '' },
    selected: { type: Array, default: Array },
    progress: Boolean,
    reorder: Function,
    selectionMode: { type: Boolean, default: true },
    itemHeight: { type: Number, default: 48 }
  },
  watch: {
    selected (value : Array<Object>, oldValue : Array<Object>) {
      let rowIntersection = value
        .filter(x => oldValue.indexOf(x) === -1)
        .concat(oldValue.filter(x => value.indexOf(x) === -1))
      if (rowIntersection.length === 0) { return }
      let keys = value.map(this.getKey)
      rowIntersection.forEach(row => {
        this.$set(row, 'state_', +keys.includes(this.getKey(row)))
      })
    },
    value (value: Array<Object>, oldValue: Array<Object>) {
      let newList = []
      value.forEach(row => {
        let key = this.getKey(row)
        if (this.selected.find(r => this.getKey(r) === key)) {
          this.$set(row, 'state_', 1)
          newList.push(row)
        }
      })

      this.$emit('select', newList)

      this.adjustTable()
      this.$nextTick(this.adjustTable.bind(this))
      this.$domBus.$off('resize')
      this.$domBus.$on('resize', this.adjustTable.bind(this))
    }
  },
  computed: {
    selectedAll: {
      get () {
        return +this.value.every(row => row.state_ === -1 || row.state_ === 1)
      },
      set (value: number) {
        this.$emit('input',
          this.value.map(row =>
            ({ ...row, state_: row.state_ !== -1 ? value : -1 })))
        this.$emit('select', value ? [...this.value.filter(row =>
          row.state_ !== -1)] : [])
      }
    }
  },
  methods: {
    adjustHeaderWidths () {
      const { tbody } = this.$refs
      const firstRow = tbody.querySelector('tr:not(.filler)')
      if (!firstRow) { return }
      const bodyTds = [...firstRow.querySelectorAll('td')]
      const boxes = bodyTds.map(element => element.getBoundingClientRect())
      if (!boxes.length || boxes[0].width === 0) { return }
      this.headersWidth = (this.selectionMode ? [] : [0])
        .concat(boxes.map(x => x.width + 'px'))
    },
    async updateVisibleItems (scroll: { top: number, bottom: number, height: number }) {
      const { scrollContainer } = this.$refs

      const extra = Math.floor(scroll.height / this.itemHeight) * 2
      let startIndex = Math.max(Math.floor(scroll.top / this.itemHeight) - extra, 0)
      let endIndex = Math.min(Math.floor(scroll.bottom / this.itemHeight) + extra,
        this.value.length)

      this.visibleItems = this.value.slice(startIndex, endIndex)
      this.previousStart = startIndex
      this.previousEnd = endIndex

      this.topItemStyle = {
        height: `${startIndex * this.itemHeight}px`
      }
      this.bottomItemStyle = {
        height: `${(this.value.length - endIndex) * this.itemHeight}px`
      }

      await this.$nextTick()

      if (scrollContainer.scrollTop !== scroll.top) {
        scrollContainer.scrollTop = scroll.top
      }
    },
    async adjustTable () {
      const { scrollContainer } = this.$refs

      // This causes reflows, caution!
      const scroll = {
        top: scrollContainer.scrollTop,
        bottom: scrollContainer.scrollTop + scrollContainer.clientHeight,
        height: scrollContainer.clientHeight
      }

      await this.updateVisibleItems(scroll)
      this.adjustHeaderWidths()
    },
    onScroll (event: window.HTMLEvent) {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
      }

      if (this.headerTimeout) {
        clearTimeout(this.headerTimeout)
      }

      const { scrollContainer } = this.$refs
      const scroll = {
        top: scrollContainer.scrollTop,
        bottom: scrollContainer.scrollTop + scrollContainer.clientHeight,
        height: scrollContainer.clientHeight
      }

      const extra = Math.floor(scroll.height / this.itemHeight / 2)

      let startIndex = Math.max(Math.floor(scroll.top / this.itemHeight) - extra, 0)
      let endIndex = Math.min(Math.floor(scroll.bottom / this.itemHeight) + extra,
        this.value.length)

      if (startIndex < this.previousStart || endIndex > this.previousEnd) {
        // Urgent, there's nothing showing on the screen!
        this.updateVisibleItems(scroll)
      } else {
        this.scrollTimeout = setTimeout(this.adjustTable, 40)
      }

      this.headerTimeout = setTimeout(this.adjustHeaderWidths, 100)

      this.scrollTop = event.target.scrollTop
    },
    onColumnClick (event: window.HTMLEvent, order: string) {
      if (order === this.currentSort) {
        this.currentSort = '-' + this.currentSort
      } else {
        this.currentSort = order
      }

      this.$nextTick(this.adjustTable.bind(this))
      this.reorder(event, this.currentSort)
    },
    onRowClick (event: window.HTMLEvent, row: Object) {
      this.$emit('rowClick', row)
      if (!this.$scopedSlots.expand) { return }

      if (row === this.expandedRow) {
        this.expandedRow = null
      } else {
        this.expandedRow = row
      }

      this.$nextTick(this.adjustTable.bind(this))
    },
    getKey (row: Object) {
      return this.trackBy instanceof Function
        ? this.trackBy(row)
        : row[this.trackBy]
    },
    onClick (clickedRow: Object, value: number) {
      let key = this.getKey(clickedRow)
      let selected = this.selected
      if (value) {
        selected = selected.concat([clickedRow])
      } else {
        selected = selected.filter(row => this.getKey(row) !== key)
      }

      this.$emit('select', selected)
    },
    onMouseDown (event: window.HTMLEvent, row: Object, index: number) {
      let toggle = +!row.state_
      this.onClick(row, toggle)
      this.dragging = toggle
      this.dragStart = index
    },
    onMouseOver (event: window.HTMLEvent, row: Object) {
      if (this.dragging !== -1 && row.state_ !== -1 &&
        row.state_ !== this.dragging) {
        this.onClick(row, this.dragging)
      }
    },
    onMouseUp () {
      this.dragging = -1
    }
  },
  data () {
    return {
      dragging: -1,
      dragStart: -1,
      ignoreNext: false,
      headersWidth: [],
      currentSort: '',
      scrollTop: 0,
      expandedRow: null,
      visibleItems: [],
      bottomItemStyle: '',
      topItemStyle: ''
    }
  },
  activated () {
    this.$refs.scrollContainer.scrollTop = this.scrollTop
  }
}
</script>

<style lang="sass">
$division: rgb(220, 220, 220)
$highlighted: #f5f5f5
$selected: #eeeeee

.datatable
  :overflow-y auto
  :overflow-x hidden
  :display flex
  :flex-flow column

  table
    :border-collapse collapse
    :width 100%

  thead, thead > tr
    :color rgba(0,0,0,.54)
    :font-weight 700
    :font-size 12px
    :user-select none
    :background white
    :z-index 1

  tr
    :height 48px
    :border 0 solid $division
    :border-bottom-width 1px
    :transition background-color .2s
  tr.filler
    :border 0
    :height 0
  tbody
    > tr.checked
      background: $selected !important
    > tr:hover
      background: $highlighted
  td
    :color rgba(0,0,0,.87)
    :font-size 13px
  td, th
    :padding 0 8px
    :text-align left
  th
    :white-space nowrap
    :cursor default
  .sortable
    :cursor pointer

  .clickable > td:not(:first-child)
    :cursor pointer

  .checkbox-cell
    :max-width 24px + 20px + 8px
    :width 24px + 20px + 8px
    :padding-left 24px
    :padding-right 8px

  .num
    :text-align right

  .center
    :text-align center

  .thead
    :table-layout fixed

  .tbody-container
    :overflow auto
    :flex 1
    > table
      :margin-top -49px

  .hidden-row
    :visibility hidden

  .progress
    :margin 0

  .sortarrow
    :display inline-block
    :position relative
    :width 14px
    :height 6px
    :padding 4px 12px
    :transition all .2s
    :transform-origin center

  .sortarrow::before
    content: ""
    position: absolute
    top: 50%
    left: 8px
    margin: -8px 0 0
    width: 8px
    height: 8px
    border: solid rgba(0, 0, 0, .54)
    border-width: 2px 0 0 2px
    margin-top: -5px
    transform: rotate(45deg)

  .sortarrow::after
    content: ""
    position: absolute
    top: 50%
    left: 11px
    margin: -8px 0 0
    width: 2px
    height: 10px
    margin-top: -5px
    background: rgba(0, 0, 0, .54)

  .arrow
    :transition all .2s
  .arrow-cell
    :padding-right 12px
    :width 36px

  .inverted
    :transform rotate(180deg)
</style>
