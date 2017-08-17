/* @flow */
// Based on https://github.com/igorescobar/jQuery-Mask-Plugin/blob/master/src/jquery.mask.js
let matches = el => (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).bind(el)

export function getCaret ({ selectionStart }: window.HTMLElement, value: any) : number {
  let pos = 0
  let dSel = (document : any).selection

  // IE Support
  if (dSel && navigator.appVersion.indexOf('MSIE 10') === -1) {
    let sel = dSel.createRange()
    sel.moveStart('character', -value.length)
    pos = sel.text.length
  } else if (selectionStart || selectionStart === '0') {
    // Firefox support
    pos = selectionStart
  }

  return pos
}

export function setCaret (el: window.HTMLElement, pos: number) {
  if (!matches(el)(':focus')) return
  // Firefox, WebKit, etc..
  if (el.setSelectionRange) {
    el.setSelectionRange(pos, pos)
  } else { // IE
    let range = el.createTextRange()
    range.collapse(true)
    range.moveEnd('character', pos)
    range.moveStart('character', pos)
    range.select()
  }
}

export function calculateCaretPosition (
  el: window.HTMLElement,
  caretPos: number,
  previousValue: string,
  newVal: string,
  keycode: number
) {
  let newValL = newVal.length
  let oValue = previousValue
  let oValueL = oValue.length

  if (oValue === newVal) {
    return
  }

  // edge cases when erasing digits
  if (keycode === 8) {
    caretPos = caretPos - (newVal.slice(0, caretPos).length - oValue.slice(0, caretPos).length)

    // edge cases when typing new digits
  } else {
    // if the cursor is at the end keep it there
    if (caretPos >= oValueL) {
      caretPos = newValL
    } else {
      caretPos = caretPos + (newVal.slice(0, caretPos).length - oValue.slice(0, caretPos).length)
    }
  }

  return caretPos
}
