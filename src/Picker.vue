<template lang="pug">
.picker(ref="picker", :class="{ lifted: opened }")
  .errinput
    input(v-model="textValue",
    :required="required", :disabled="disabled", type="text",
    :class="{ touched, filled: textValue }" @blur="onBlur"
    @invalid.prevent="onInvalid" @input="onInput" @keydown="onKeyDown"
    @focus="active = true; opened = true" @mousewheel="onWheel"
    @DOMMouseScroll='onWheel', :name="name" ref="input" autocomplete="off")
    span.bar
    label {{ label }}
      span.star(v-if="required") *
    span.helper(v-if="!hideHelper")
      span.error {{ validationMessage }}
  transition(name="fade")
    .popper(ref="popper" v-show="opened", :style="{ top, left }")
      .pickerview
        .pickers(v-for="(date, ix) in selected", :class="{ second: ix }")
          .picker
            .current
              .year {{ date.getFullYear() }}
              div {{ date | display }}
            .month
              .monthpicker
                .clickable(@click="addMonth(ix, -1)" v-waves): .arrow.left
                .monthyear {{ monthDisplay[ix] | monthYear }}
                .clickable(@click="addMonth(ix,  1)" v-waves): .arrow.right
              .weekdays
                .clickable.weekday(v-for="weekday in weekdays") {{ weekday }}
              .daypicker(ref="monthdays")
                .clickable(v-for="i in 42",
                @click="setDay(ix, i - relativeDay[ix], monthDisplay[ix])",
                :class="relativeCssList[ix][i]")
                  | {{ monthDisplay[ix] | weekDay(i) }}
          .picker.time(v-if="type.includes('t')")
            .current.time
              .clickable(@click="add(ix, 'h',  1)" v-waves): .arrow.up
              .clickable(@click="add(ix, 'h', -1)" v-waves): .arrow
              div(@click="hourMode.splice(ix, 1, true)") {{ date.getHours() | pad }}
              | :
              div(@click="hourMode.splice(ix, 1, false)") {{ date.getMinutes() | pad }}
              .clickable(@click="add(ix, 'm',  1)" v-waves): .arrow.up
              .clickable(@click="add(ix, 'm', -1)" v-waves): .arrow
            transition(name='zoom' mode="out-in")
              div(v-if="hourMode[ix]" key="hour")
                .clock(@click="mouse && setClock(ix, $event)"
                @mousemove="mouse && setClock(ix, $event)"
                @mousedown.prevent="mouse = true; setClock(ix, $event)"
                @mouseup="onMouseUp(ix, $event)")
                  .clockcenter
                  .clockpointer(
                  :style="{ transform: `rotate(${pointerRotation[ix].hour}deg)` }")
                  .clickable.clockitem(v-for="i in 12",
                  :class="{ selected: date.getHours() === i }",
                  :style="{ transform: `translate(${rotation[i-1].x * 85}px," +
                    "${rotation[i-1].y * 85}px)` }")
                    | {{ i }}
                  .clickable.clockitem.small(v-for="i in 12",
                  :class="{ selected: date.getHours() === (i == 1 ? 0 : i + 11) }",
                  :style="{ transform: `translate(${rotation[i-1].x * 55}px," +
                  "${rotation[i-1].y * 55}px)` }")
                    | {{ i == 1 ? '00' : i + 11 }}
              div(v-else)
                .clock(@click="mouse && setClock(ix, $event)"
                @mousemove="mouse && setClock(ix, $event)"
                @mousedown.prevent="mouse = true; setClock(ix, $event)"
                @mouseup="onMouseUp(ix, $event)")
                  .clockcenter
                  .clockpointer.longer(
                  :style="{ transform: `rotate(${pointerRotation[ix].minute + 180}deg)` }")
                  .clockcenter(
                  :style="{ transform: `rotate(${pointerRotation[ix].minute}deg)`," +
                           "'transform-origin': '3px 88px', top: '12px' }")
                  .clickable.clockitem.minutes(v-for="i in 12",
                  @mousedown.prevent="setMinute(ix, (i - 1) * 5)",
                  @mousemove="mouse && setMinute(ix, (i - 1) * 5)",
                  :class="{ selected: date.getMinutes() === (i - 1) * 5 }",
                  :style="{ transform: `translate(${rotation[i-1].x * 85}px," +
                  "${rotation[i-1].y * 85}px)` }")
                    | {{ (i - 1) * 5 | pad }}
</template>

<script>
/* @flow */
import { requiredMessage } from './UI'
import { getCaret, setCaret } from './services/mask'
import { clamp } from './services/utils'
import fecha from 'fecha'

async function time (delay) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delay)
  })
}

const ARROW_LEFT = 37
const ARROW_UP = 38
const ARROW_RIGHT = 39
const ARROW_DOWN = 40
const BACKSPACE = 8
const DELETE = 46

function createMask (input, forFecha) {
  const startEnd = input[0] === '*'
  startEnd && (input = input.slice(1))
  const single = input.replace(/d/g, ' DD/MM/YYYY ').replace(/t/g, 'HH:mm ')
  return !forFecha && startEnd ? (single + '-' + single).trim() : single.trim()
}

export default {
  props: {
    name: String,
    label: String,
    value: Array,
    required: Boolean,
    disabled: Boolean,
    type: { type: String, default: '*dt' },
    hideHelper: { type: Boolean, default: false }
  },
  filters: {
    display (value: Date) {
      return value && fecha.format(value, 'ddd, MMM[\xA0]DD')
    },
    weekDay (value: Date, i: number) {
      if (!value) { return }
      let daysInMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0)
        .getDate()
      let weekDay = new Date(value.getFullYear(), value.getMonth()).getDay()

      let x = i - weekDay
      return (x < 1 || x > daysInMonth) ? '' : x
    },
    monthYear (value: Date) {
      return value && fecha.format(value, 'MMMM YYYY')
    }
  },
  data () {
    const fechaMask = createMask(this.type, true)
    return {
      active: false,
      touched: false,
      validationMessage: requiredMessage,
      textValue: this.value && this.value.every(x => x !== null) &&
        this.value.map(x => fecha.format(x, fechaMask)).join(' - ') || '',
      privateSelected: this.value && (this.value.every(x => x !== null) ? this.value : null) ||
        (this.value && this.value.map(x => new Date())) || [new Date()],
      mask: createMask(this.type).replace(/\w/g, '_'),
      fechask: fechaMask,
      code: null,
      opened: false,
      top: '0',
      left: '0',
      weekdays: fecha.i18n.dayNamesShort,
      hourMode: [true, false],
      monthDisplay: this.value && this.value.every(x => x !== null) && this.value.map(x => new Date(x)) || [new Date(), new Date()],
      mouse: false
    }
  },
  watch: {
    opened (value: boolean) {
      if (value) {
        this.monthDisplay = this.privateSelected && this.privateSelected.map(x => new Date(x)) || [new Date(), new Date()]

        this.$domBus.$emit('backdrop', true)
        this.$domBus.$on('backdrop-click', _ => {
          this.opened = false
          this.$domBus.$emit('backdrop', false)
        })

        let { input, picker } = this.$refs
        let adjustPosition = _ => {
          let selectedRect = input.getBoundingClientRect()
          let pickerRect = picker.getBoundingClientRect()

          let realTop = Math.max(selectedRect.top, 8) - 16 - 8 +
            pickerRect.height

          if (realTop > window.innerHeight - 292 - 16) {
            realTop = selectedRect.top - 292 - 16
          }

          let realLeft = Math.min(selectedRect.left - 8,
            window.innerWidth - (232 * (this.type[0] === '*' ? 2 : 1)) - 16)

          this.top = realTop + 'px'
          this.left = realLeft + 'px'
        }

        adjustPosition()
        this.$domBus.$on('scroll', adjustPosition)
        this.$domBus.$on('resize', adjustPosition)
      } else {
        this.$domBus.$emit('backdrop', false)
        this.$domBus.$off('scroll')
        this.$domBus.$off('resize')
      }
    }
  },
  computed: {
    relativeCssList () {
      let days = [...Array(43).keys()].slice(0)
      let rangeMode = this.selected.length === 2
      return this.selected.map((date, ix) => {
        let reference = this.monthDisplay[ix]
        let firstWeekDay = new Date(reference.getFullYear(), reference.getMonth())
          .getDay()
        let monthSize = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
          .getDate()
        return days.map(relativeDay => {
          let day = relativeDay - firstWeekDay

          if (day > monthSize || day < 1) { return { empty: true } }
          if (day === date.getDate() &&
            reference.getMonth() === date.getMonth() &&
            reference.getFullYear() === date.getFullYear()) {
            return { selected: day === date.getDate() }
          }

          if (rangeMode) {
            let dayDate = new Date(reference.getFullYear(),
              reference.getMonth(), day)
            let pureDates = this.selected.map(x =>
              new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime())
            let between = dayDate.getTime() >= pureDates[0] &&
              dayDate.getTime() <= pureDates[1]
            return { between }
          }

          return { }
        })
      })
    },
    relativeDay () {
      return this.monthDisplay.map(date => {
        return new Date(date.getFullYear(), date.getMonth()).getDay()
      })
    },
    rotation () {
      let array = []
      for (let i = 0; i < 12; i++) {
        let x = Math.cos((i - 3) * Math.PI / 6)
        let y = Math.sin((i - 3) * Math.PI / 6)
        array.push({ x, y })
      }
      return array
    },
    pointerRotation () {
      return this.selected && this.selected.map(date => {
        let hour = date.getHours()

        return {
          hour: ((hour > 12 ? hour : (hour || 1) - 1) + 6) * 30,
          minute: date.getMinutes() / 5 * 30
        }
      })
    },
    selected: {
      get () { return this.privateSelected },
      set (val: Array<Object>) {
        let selected
        if (typeof val === 'string' && val.length !== this.mask.length) {
          this.textValue = val
          // We keep the original and send a fake one
          selected = null
        } else {
          let parse
          if (typeof val === 'string') {
            // We just assume it works because it better do
            parse = val.split(' - ').map(x => fecha.parse(x, this.fechask))
          } else {
            parse = val
          }

          if (parse.length === 2 && parse[0].getTime() > parse[1].getTime()) {
            // We don't play by your rules.
            // If you try to flip the game, we flip the table it's in.
            parse = [parse[1], parse[0]]
          }

          this.textValue = parse
            .map(x => fecha.format(x, this.fechask)).join(' - ')
          this.privateSelected = parse
          selected = parse
        }

        if (this.required) {
          this.validationMessageDOM = this.validationMessage =
            selected ? '' : requiredMessage
        }
        this.$emit('input', selected)
      }
    },
    validationMessageDOM: {
      get () { return this.$refs.input.validationMessage },
      set (value: string) { return this.$refs.input.setCustomValidity(value) }
    }
  },
  methods: {
    onInput ({ target: input }: window.HTMLEvent) {
      let pos = getCaret(input, this.textValue)

      const numbersOnly = [...this.textValue].filter(ch => /\d/.test(ch))

      let offset = 0
      if ([BACKSPACE, DELETE].includes(this.code) && this.mask[pos] !== '_') {
        offset = this.code === BACKSPACE ? -1 : 0
        const maskVsNumberOffset = this.textValue.length - numbersOnly.length
        numbersOnly.splice(pos - maskVsNumberOffset + offset, 1)
      }

      let i = 0
      let lastIndex

      const result = this.mask.replace(/_/g, (ch, index) => {
        // We have run out of numbers
        if (!numbersOnly[i]) { return }
        lastIndex = index
        return numbersOnly[i++]
      }).slice(0, lastIndex + 1)

      // TODO: Fix bug with selection
      // How to replicate:
      // 23/23/2323 23[:2]3 <- selection
      // Change to something else, caret gets in the wrong place
      // We need context information for fixing this.

      const valueLength = this.textValue.length
      if (result.length > valueLength && pos === valueLength) {
        pos = result.length
      } else if (result.length > valueLength && this.mask[pos - 1] !== '_') {
        pos += 1
      } else {
        pos += offset
      }

      this.$nextTick(_ => setCaret(input, pos))
      this.selected = result
    },
    onKeyDown (e: window.HTMLEvent) {
      this.code = e.keyCode

      if ([ARROW_UP, ARROW_DOWN].includes(e.keyCode)) {
        let deltaY = e.keyCode === ARROW_DOWN ? 1 : -1
        this.onWheel({ target: e.target, deltaY })
        return e.preventDefault()
      }

      const input = e.target
      if (input.selectionStart === input.selectionEnd) {
        const pos = input.selectionEnd
        if (e.keyCode === ARROW_RIGHT && this.mask[pos + 1] === '-') {
          setCaret(input, pos + 2)
        } else if (e.keyCode === ARROW_LEFT && this.mask[pos - 2] === '-') {
          setCaret(input, pos - 2)
        }
      }

      if (e.code === 'Tab') { this.opened = false }
      if (e.altKey || e.ctrlKey || e.metaKey ||
        !['Key', 'Digit', 'Numpad'].some(x => e.code.startsWith(x))) { return }
      if (!/(Digit|Numpad)\d/.test(e.code)) { return e.preventDefault() }

      // If we have a selection, it better have some editable characters!
      const sel = this.mask.slice(input.selectionStart, input.selectionEnd)
      if (this.textValue.length === this.mask.length && !sel.includes('_')) {
        return e.preventDefault()
      }
    },
    onWheel (e: window.HTMLEvent) {
      const input = e.target
      if (!input.selectionStart && !this.textValue.length) { return }

      // Forward search the last placeholder
      let i = Math.max(input.selectionStart, input.selectionEnd)
      while (this.mask[i] && this.mask[i] === '_') { i++ }

      // Backtrack a bit to find the size...
      let size = 0
      while (this.mask[i - 1] && this.mask[i - 1] === '_') { size++; i-- }

      // Firefox uses detail, Chrome uses deltaY
      const delta = clamp(-e.deltaY || -e.detail, -1, 1)
      const number = clamp(Number(this.textValue.slice(i, i + size)) + delta,
        0, 10 ** size - 1)
      const result = this.textValue.slice(0, i) +
        ('000' + number).slice(-size) + this.textValue.slice(i + size)

      this.selected = result
      this.$nextTick(_ => setCaret(input, i + size))
    },
    onBlur () {
      this.active && (this.touched = true)
      this.active = false
    },
    onInvalid () {
      console.log('wot')
    },
    async addMonth (index: number, amount: number) {
      const animationClasses = this.$refs.monthdays[index].classList
      const direction = amount > 0 ? 'aright' : 'aleft'

      animationClasses.add(direction)
      // TODO: Use event listeners instead of hacking into await time.
      await time(200)

      let monthDisplay = this.monthDisplay[index]
      monthDisplay.setMonth(monthDisplay.getMonth() + amount)
      this.monthDisplay.splice(index, 1, monthDisplay)

      await time(200)
      animationClasses.remove(direction)
    },
    add (index: number, type: string, amount: number) {
      const fullType = { h: 'Hours', m: 'Minutes' }[type]
      let all = [...this.privateSelected]
      let selected = all[index]
      selected['set' + fullType](selected['get' + fullType]() + amount)
      this.selected = all
    },
    setDay (index: number, day: number, reference: Date) {
      let all = [...this.privateSelected]
      let selected = all[index]
      let monthSize = new Date(reference.getFullYear(),
        reference.getMonth() + 1, 0).getDate()
      if (day < 1 || day > monthSize) { return }
      selected.setYear(reference.getFullYear())
      selected.setMonth(reference.getMonth())
      selected.setDate(day)
      this.selected = all
    },
    setMinute (index: number, minute: number) {
      let all = [...this.privateSelected]
      let selected = all[index]

      selected.setMinutes(minute)
      this.selected = all
    },
    setClock (
      index: number,
      { target, clientX, clientY, buttons, type }: window.HTMLEvent
    ) {
      if (type === 'click') { buttons = 1 }
      if (type === 'mouseup') { buttons = 1 }
      if (buttons !== 1) { return }
      if (target.classList[0] !== 'clock') { return }

      let bounds = target.getBoundingClientRect()
      let relativeX = clientX - bounds.left - 100
      let relativeY = clientY - bounds.top - 100

      let angle = Math.atan2(relativeX, relativeY)
      let clockPosition = -((angle * 180 / Math.PI) - 180)
      let distance = Math.sqrt((relativeX ** 2) + (relativeY ** 2))

      let all = [...this.privateSelected]
      let selected = all[index]
      if (this.hourMode[index]) {
        let clockValue
        if (distance < 70) {
          clockValue =
            ((Math.round(clockPosition / (360 / 12)) % 12) || -12) + 12
        } else {
          clockValue = (Math.round(clockPosition / (360 / 12)) % 12) + 1
        }

        selected.setHours(clockValue)
      } else {
        selected.setMinutes(Math.round(clockPosition / (360 / 60)) % 60)
      }
      this.selected = all
    },
    onMouseUp (ix: number, event: window.HTMLEvent) {
      this.mouse = false
      this.setClock(ix, event)
      this.$nextTick(_ => { this.hourMode.splice(ix, 1, !this.hourMode[ix]) })
    }
  }
}
</script>

<style lang="sass">
@import 'shadows';
@import 'mixins';
@import 'colors';
@import 'UI.sass';

.picker
  :transition box-shadow .2s

  &.lifted
    :box-shadow $whiteframe-shadow-1dp
    :z-index 100
    :background white
    .errinput
      :z-index 100

  .popper
    :flex-direction column
    :background-color white
    :position fixed
    :box-shadow $whiteframe-shadow-1dp
    :z-index 100
    :overflow hidden
  .padded
    :padding 8px

  .pickers, .pickerview
    :display flex
    :flex-flow row

  .picker
    *
      :display flex
      :flex-flow row

    // So we don't flicker on animating the clock
    :min-width 200px + 16 + 16
    :flex-flow column
    :height 100%

  .clickable
    :justify-content center
    :align-items center
    :width 32px
    :height 32px
    :font-size 12px
    :border-radius 50%
    :cursor pointer
    :user-select none
    // Have to override waves-effect
    :display flex
  .clickable.empty
    :cursor default
  .selected, .between
    :color #fff

  @include two-colors('background', '.current', $primary, $secondary)
  @include two-colors('background', '.selected', $primary-strong, $secondary-strong)
  @include two-colors('background', '.between', lighten($primary, 20), $secondary-light)
  @include two-colors('background', '.clockpointer', $primary-strong, $secondary-strong)
  @include two-colors('background', '.clockcenter', $primary-strong, $secondary-strong)
  @include two-colors('color', '.year', $primary-light, $secondary-light)

  .current
    :flex-flow column
    :color #fff
    :padding 8px
    :font-size 22px
    :justify-content center
    :user-select none
    :height 60px
  .year
    :font-size 14px
  .current.time
    :flex-flow row
    :align-items center
    :font-size 28px
    :cursor pointer

  .weekdays
    :padding 0 2px
  .daypicker
    :flex-wrap wrap
    :min-width 7 * 32px + 8
    :max-width 7 * 32px + 8
    :padding 0 2px 2px 2px
  .month
    :flex-flow column
    :overflow hidden
  .monthyear
    :flex 1
    :justify-content center
    :align-items center
  .weekday
    :color rgb(138, 138, 138)

  .clock
    :width 200px
    :height 200px
    :background rgb(237, 237, 237)
    :border-radius 50%
    :margin 16px
    :position relative
    :cursor pointer
    :align-self center
  .clockitem, .clockcenter, .clockpointer
    :pointer-events none
  .clockitem
    :position absolute
    :left 100px - 16
    :top 100px - 16
  .clockitem.minutes
    :pointer-events auto
  .clockitem.small
    :font-size 11px
    :color rgb(138, 138, 138)
  .clockitem.small.selected
    :color #fff
  .clockcenter
    :position absolute
    :left 100px - 3px
    :top 100px - 3px
    :width 6px
    :height 6px
    :border-radius 50%
    :pointer-events none
  .clockpointer
    :position absolute
    :left 100px - 1px
    :top 100px - 1px
    :width 2px
    :height 70px
    :transform-origin 1px 1px
  .clockpointer.longer
    :height 88px

  .arrow
    :border-top 8px solid #fff
    :margin-left 0
  .arrow.up
    :border-top 0 solid transparent
    :border-bottom 8px solid #fff
  .monthpicker .arrow
    :border-top 6px solid transparent
    :border-bottom 6px solid transparent
  .monthpicker .arrow.left
    :margin-left -7px
    :border-right 6px solid #000
  .monthpicker .arrow.right
    :margin-left 7px
    :border-left 6px solid #000

  .errinput
    :flex 1

  .zoom-enter-active
    :transition all 0.3s cubic-bezier(0.35, 0, 0.25, 1)
    :animation: zoom .2s
  .zoom-leave-active
    :animation zoom .2s reverse

  .aright
    :animation .2s left, .2s right .2s

  .aleft
    :animation .2s right reverse, .2s left .2s reverse

  @keyframes left
    0%
      :transform translateX(0)
    to
      :transform translateX(-224px - 2 - 2 - 2)

  @keyframes right
    0%
      :transform translateX(224px + 2 + 2 + 2)
    to
      :transform translateX(0)

  @keyframes zoom
    0%
      opacity: 0
      transform: scale(0.95)
    70%
      opacity: 1
      transform: scale(1.05)
    to
      transform: scale(1.0)
</style>
