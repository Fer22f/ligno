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
        template(v-for="(row, index) in value")
          tr(:class="[{ checked: row.state_ === 1, clickable: $scopedSlots.expand }, classList(row)]"
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
    selectionMode: { type: Boolean, default: true }
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

      if (value.length) {
        this.$nextTick(this.calculateStyles.bind(this))
        this.$domBus.$off('resize')
        this.$domBus.$on('resize', this.calculateStyles.bind(this))
      }
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
    onScroll ({ target }: window.HTMLEvent) {
      this.scrollTop = target.scrollTop
    },
    onColumnClick (event: window.HTMLEvent, order: string) {
      if (order === this.currentSort) {
        this.currentSort = '-' + this.currentSort
      } else {
        this.currentSort = order
      }
      this.$nextTick(this.calculateStyles.bind(this))

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

      this.$nextTick(this.calculateStyles.bind(this))
    },
    calculateStyles () {
      const { tbody } = this.$refs
      const bodyTds = [...tbody.querySelector('tr').querySelectorAll('td')]
      const boxes = bodyTds.map(element => element.getBoundingClientRect())
      if (boxes[0].width === 0) { return }
      this.headersWidth = (this.selectionMode ? [] : [0])
        .concat(boxes.map(x => x.width + 'px'))
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
      expandedRow: null
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
    :flex 1
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
