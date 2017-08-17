<template lang="pug">
.tab(:data-name="name")
  slot
</template>

<script>
/* @flow */
export default {
  props: { name: Number }
}
</script>


<style lang="sass">
.tab
  :display flex
  :overflow auto
  :width 100%
  :height 100%
</style>
