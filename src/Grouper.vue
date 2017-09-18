<template lang="pug">
.grouper
  slot(:active="active")
</template>

<script>
export default {
  data () {
    return {
      active: false
    }
  },
  mounted () {
    let mainElement = this.$children[0]

    this.$children.slice(0, -1).forEach((component, i) => {
      component.$on('input', input => {
        // Reached limit
        if (input.length === component.maxlength) {
          this.$children[i + 1].focus()
        }
      })
    })

    this.$children.slice(1).forEach((component, i) => {
      component.$on('focus', active => {
        mainElement.fakeFilled = true
      })

      component.$on('blur', active => {
        mainElement.fakeFilled = this.$children.slice(1).some(c => c.value)
      })
    })
  }
}
</script>
