import { ref } from 'vue'

export const currentCurrency = ref(localStorage.getItem('preferred_currency') || 'XOF')

export const availableCurrencies = [
  { code: 'XOF', symbol: 'F CFA', label: 'CFA (XOF)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' }
]

// Base conversion rates relative to XOF (FCFA)
const exchangeRatesToXof = {
  XOF: 1,
  EUR: 655.957,
  USD: 600
}

export const setCurrency = (code) => {
  if (exchangeRatesToXof[code?.toUpperCase()]) {
    currentCurrency.value = code.toUpperCase()
    localStorage.setItem('preferred_currency', currentCurrency.value)
  }
}

export const convertAmount = (amount, fromCurrency = 'XOF', targetCurrency = currentCurrency.value) => {
  const num = Number(amount) || 0
  const fromRate = exchangeRatesToXof[fromCurrency?.toUpperCase()] || exchangeRatesToXof.XOF
  const toRate = exchangeRatesToXof[targetCurrency?.toUpperCase()] || exchangeRatesToXof.XOF

  // Convert to XOF first, then to target currency
  const amountInXof = num * fromRate
  return amountInXof / toRate
}

export const formatPrice = (amount, fromCurrency = 'XOF', targetCurrency = currentCurrency.value) => {
  const converted = convertAmount(amount, fromCurrency, targetCurrency)
  const code = (targetCurrency || currentCurrency.value).toUpperCase()

  if (code === 'EUR') {
    return `${converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
  }
  if (code === 'USD') {
    return `$ ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${Math.round(converted).toLocaleString('fr-FR')} F CFA`
}

export default {
  currentCurrency,
  availableCurrencies,
  setCurrency,
  convertAmount,
  formatPrice
}
