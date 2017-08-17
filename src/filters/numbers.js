export const currency = value => {
  if (!value) { return '—' }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).replace(/\$/, '$\xa0')
}
