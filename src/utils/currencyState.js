import { ref, reactive } from 'vue'
import currency from 'currency.js'

export const currentCurrency = ref(localStorage.getItem('preferred_currency') || 'XOF')
export const isLiveRatesLoading = ref(false)
export const lastRatesUpdated = ref(localStorage.getItem('rates_last_updated') || null)

export const availableCurrencies = [
  { code: 'XOF', symbol: 'F CFA', label: 'CFA (XOF)', precision: 0 },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', precision: 2 },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', precision: 2 },
  { code: 'CAD', symbol: '$', label: 'Dollar Canadien (CAD)', precision: 2 },
  { code: 'GBP', symbol: '£', label: 'Livre Sterling (£)', precision: 2 }
]

// Fallback base conversion rates relative to XOF (FCFA)
const defaultRatesToXof = {
  XOF: 1,
  EUR: 655.957,
  USD: 600,
  CAD: 440,
  GBP: 760
}

// Reactive object holding current active rates relative to 1 unit of currency -> XOF
const cachedRates = (() => {
  try {
    const saved = localStorage.getItem('exchange_rates_to_xof')
    return saved ? JSON.parse(saved) : defaultRatesToXof
  } catch (e) {
    return defaultRatesToXof
  }
})()

export const exchangeRatesToXof = reactive(cachedRates)

/**
 * Fetch live market exchange rates from Open Exchange Rates API
 */
export const fetchLiveExchangeRates = async (force = false) => {
  const ONE_HOUR = 60 * 60 * 1000
  const lastUpdate = Number(localStorage.getItem('rates_last_updated_time') || 0)

  if (!force && lastUpdate && Date.now() - lastUpdate < ONE_HOUR) {
    return // Use cache if updated less than 1 hour ago
  }

  isLiveRatesLoading.value = true
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR')
    if (!res.ok) throw new Error('Erreur API taux de change')

    const data = await res.json()
    if (data && data.rates && data.rates.XOF) {
      const eurToXof = data.rates.XOF // e.g. 655.957

      // Calculate rates relative to XOF
      // 1 EUR = eurToXof XOF
      // 1 USD = (eurToXof / rates.USD) XOF
      const newRates = {
        XOF: 1,
        EUR: eurToXof,
        USD: data.rates.USD ? eurToXof / data.rates.USD : defaultRatesToXof.USD,
        CAD: data.rates.CAD ? eurToXof / data.rates.CAD : defaultRatesToXof.CAD,
        GBP: data.rates.GBP ? eurToXof / data.rates.GBP : defaultRatesToXof.GBP
      }

      Object.assign(exchangeRatesToXof, newRates)
      const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      lastRatesUpdated.value = nowStr

      localStorage.setItem('exchange_rates_to_xof', JSON.stringify(newRates))
      localStorage.setItem('rates_last_updated', nowStr)
      localStorage.setItem('rates_last_updated_time', Date.now().toString())
    }
  } catch (err) {
    console.warn('[Currency] Impossible de charger les taux en temps réel, utilisation des taux enregistrés:', err)
  } finally {
    isLiveRatesLoading.value = false
  }
}

// Automatically fetch live rates on module initialization
fetchLiveExchangeRates()

export const setCurrency = (code) => {
  if (code && exchangeRatesToXof[code.toUpperCase()]) {
    currentCurrency.value = code.toUpperCase()
    localStorage.setItem('preferred_currency', currentCurrency.value)
  }
}

/**
 * Precise currency conversion using currency.js to prevent floating point inaccuracy
 */
export const convertAmount = (amount, fromCurrency = 'XOF', targetCurrency = currentCurrency.value) => {
  const num = Number(amount) || 0
  const fromCode = (fromCurrency || 'XOF').toUpperCase()
  const targetCode = (targetCurrency || currentCurrency.value || 'XOF').toUpperCase()

  const fromRate = exchangeRatesToXof[fromCode] || defaultRatesToXof[fromCode] || 1
  const toRate = exchangeRatesToXof[targetCode] || defaultRatesToXof[targetCode] || 1

  // Convert to base currency (XOF) then to target currency using currency.js
  const amountInXof = currency(num).multiply(fromRate)
  const converted = currency(amountInXof).divide(toRate)

  return converted.value
}

/**
 * Formats amount into target currency string representation
 */
export const formatPrice = (amount, fromCurrency = 'XOF', targetCurrency = currentCurrency.value) => {
  const targetCode = (targetCurrency || currentCurrency.value || 'XOF').toUpperCase()
  const value = convertAmount(amount, fromCurrency, targetCode)

  if (targetCode === 'EUR') {
    return currency(value, { symbol: '', separator: ' ', decimal: ',', precision: 2 }).format() + ' €'
  }
  if (targetCode === 'USD') {
    return '$ ' + currency(value, { symbol: '', separator: ',', decimal: '.', precision: 2 }).format()
  }
  if (targetCode === 'CAD') {
    return '$ ' + currency(value, { symbol: '', separator: ',', decimal: '.', precision: 2 }).format() + ' CAD'
  }
  if (targetCode === 'GBP') {
    return '£ ' + currency(value, { symbol: '', separator: ',', decimal: '.', precision: 2 }).format()
  }

  // Default: XOF (CFA) - rounded to whole integer without decimals
  return currency(value, { symbol: '', separator: ' ', precision: 0 }).format() + ' F CFA'
}

export const formatAmount = formatPrice
export const formatCurrency = formatPrice

/**
 * Helper for precise additions
 */
export const addPrices = (a, b) => currency(a).add(b).value

/**
 * Helper for precise subtractions
 */
export const subtractPrices = (a, b) => currency(a).subtract(b).value

/**
 * Helper for precise multiplications
 */
export const multiplyPrice = (a, factor) => currency(a).multiply(factor).value

export default {
  currentCurrency,
  availableCurrencies,
  exchangeRatesToXof,
  isLiveRatesLoading,
  lastRatesUpdated,
  fetchLiveExchangeRates,
  setCurrency,
  convertAmount,
  formatPrice,
  addPrices,
  subtractPrices,
  multiplyPrice
}


