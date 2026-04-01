export const CURRENCIES = {
  USD: { name: 'Dólar Americano',    flag: '🇺🇸', symbol: '$',   code: 'USD' },
  EUR: { name: 'Euro',               flag: '🇪🇺', symbol: '€',   code: 'EUR' },
  GBP: { name: 'Libra Esterlina',    flag: '🇬🇧', symbol: '£',   code: 'GBP' },
  COP: { name: 'Peso Colombiano',    flag: '🇨🇴', symbol: '$',   code: 'COP' },
  MXN: { name: 'Peso Mexicano',      flag: '🇲🇽', symbol: '$',   code: 'MXN' },
  BRL: { name: 'Real Brasileño',     flag: '🇧🇷', symbol: 'R$',  code: 'BRL' },
  JPY: { name: 'Yen Japonés',        flag: '🇯🇵', symbol: '¥',   code: 'JPY' },
  CHF: { name: 'Franco Suizo',       flag: '🇨🇭', symbol: 'Fr',  code: 'CHF' },
  CAD: { name: 'Dólar Canadiense',   flag: '🇨🇦', symbol: '$',   code: 'CAD' },
  ARS: { name: 'Peso Argentino',     flag: '🇦🇷', symbol: '$',   code: 'ARS' },
  CLP: { name: 'Peso Chileno',       flag: '🇨🇱', symbol: '$',   code: 'CLP' },
  PEN: { name: 'Sol Peruano',        flag: '🇵🇪', symbol: 'S/',  code: 'PEN' },
}

export function formatAmount(amount, currency) {
  const decimals = ['JPY', 'CLP', 'COP'].includes(currency) ? 0 : 2
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}
