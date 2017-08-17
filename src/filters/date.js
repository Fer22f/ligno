import fecha from 'fecha'

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta',
  'Sexta', 'Sábado']
fecha.i18n = {
  dayNames,
  dayNamesShort: dayNames.map(x => x.slice(0, 3)),
  monthNames,
  monthNamesShort: monthNames.map(x => x.slice(0, 3))
}

export function datetime (value) {
  if (!value) { return '' }
  return fecha.format(new Date(value), 'DD/MM/YY HH:mm')
}

export function date (value, format) {
  if (!value) { return '' }
  if (format) { return fecha.format(new Date(value), format) }
  return fecha.format(new Date(value), 'DD/MM/YY')
}

export function time (value) {
  if (!value) { return '' }
  return fecha.format(new Date(value), 'HH:mm')
}

export function beautifulDate (input) {
  if (!input) { return '' }
  input = new Date(input)
  const today = new Date()
  if (input.getFullYear() !== today.getFullYear()) {
    return fecha.format(input, 'D MMM YY')
  }
  const sameMonth = input.getMonth() === today.getMonth()
  if (sameMonth && today.getDate() === input.getDate()) { return 'Hoje' }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (yesterday.getMonth() === input.getMonth() &&
    yesterday.getDate() === input.getDate()) { return 'Ontem' }
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  if (lastWeek.getTime() < input.getTime()) {
    return fecha.format(input, 'dddd')
  }
  return fecha.format(input, 'D MMM')
}
