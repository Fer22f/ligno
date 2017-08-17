<style lang="sass">
@import '../components/colors';

.snackbar-enter-active
  animation: snackbar .2s ease-out
.snackbar-leave-active
  :animation snackbar .2s reverse ease-in

@keyframes snackbar
  from
    :bottom -48px
  to
    :bottom 24px

.snackbar
  :position absolute
  :background rgb(50, 50, 50)
  :padding 7px 12px
  :height 48px
  :left 50%
  :bottom 24px
  :transform translateX(-50%)
  :min-width 288px
.snackbar > span
  :font-size 14px
  :color #fff
  :padding 7px 12px
.snackbar > .textbutton
  :background rgb(50, 50, 50)
  :color rgb(202, 81, 68)
  :margin-left 12px
  :font-weight 600
.snackbar > button.textbutton:hover
  :background lighten(rgb(50, 50, 50), 5)
</style>
