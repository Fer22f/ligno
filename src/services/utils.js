export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
export const pick = (obj, keysOrFn = x => x !== null) => {
  let newObj = {}
  if (keysOrFn instanceof Function) {
    Object.entries(obj).forEach(([key, value]) => {
      if (keysOrFn(value)) {
        newObj[key] = value
      }
    })
  } else {
    keysOrFn.forEach(key => {
      if (key in obj) {
        newObj[key] = obj[key]
      }
    })
  }
  return newObj
}

export const jsonFromForm = (form) => {
  let result = {}

  for (let { name, type, value, checked, selectedOptions, parentNode }
    of [...form.elements]) {
    if (!name) continue

    if (type === 'select-multiple' || type === 'select-one') {
      for (let elm of selectedOptions) {
        result[name] = elm.value
      }
    } else if (type === 'checkbox' && checked) {
      result[name] = value
    } else {
      if (parentNode.parentNode.classList[0] === 'picker' || type === 'file') {
        continue
      }
      result[name] = value
    }
  }

  return result
}

export const date = function (date) {
  let d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const dateFinal = function (date) {
  let d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export const debounce = (func, threshold) => {
  let timeout

  return function (...args) {
    if (timeout) { clearTimeout(timeout) }

    timeout = setTimeout(_ => {
      func.call(this, ...args)
      timeout = null
    }, threshold)
  }
}
