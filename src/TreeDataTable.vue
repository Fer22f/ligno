<template lang="pug">
.treedatatable.datatable
  table
    thead
      tr
        th(v-for="column in columns", :class="column.type" v-once)
          | {{ column.name }}
    tbody
      slot(:rowKey="key", :row="value" v-for="(value, key) in data")
</template>

<script>
/* @flow */
export default {
  props: {
    data: { type: Object, default: Object },
    columns: Array
  }
}
</script>

<style lang="sass">
@import 'colors';

.treedatatable
  .root
    > td
      :background $indigo-500
      :color #fff
      :font-weight 500
    .textbutton
      :background $indigo-500
      :color #fff
      :margin 0 8px
    .textbutton.red
      :color #f44336
    .textbutton:hover
      :background blend-black($indigo-500, 6%)
</style>
