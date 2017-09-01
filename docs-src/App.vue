<template lang="pug">
div#app
  .top
    text-box(v-model="value" label="Very nice!")
  data-table(:columns="columns" :value="data" :selectionMode="false")
    template(scope="$")
      td {{$.row.Id}}
      td {{$.row.Name}}
      td {{$.row.Surname}}
      td {{$.row.CreationDate}}
      td {{$.row.Birthday}}
      td {{$.row.LuckyNumber}}
</template>

<script>
export default {
  data () {
    return {
      columns: [
        { name: 'Id', type: 'num' },
        { name: 'Name' },
        { name: 'Surname' },
        { name: 'Creation Date' },
        { name: 'Birthday' },
        { name: 'Lucky Number' }
      ],
      data: [...Array(930).keys()].map(i => ({
        Id: i,
        Name: 'Facetious',
        Surname: 'Magnifecent',
        CreationDate: new Date(Math.random() * 1000000000000),
        Birthday: new Date(Math.random() * 1000000000000),
        LuckyNumber: Math.random() * 1000
      })),
      value: ''
    }
  }
}
</script>

<style lang="sass">
@import '../src/UI.sass';

#app
  font-family: 'Roboto'
  display: flex
  flex: 1
  flex-flow: column

#app
  > .datatable
    flex: 1
  > .top
    :padding 8px
    > *
    :padding 8px

html, body
  :width 100%
  :height 100%
  :display flex
  :margin 0
</style>
