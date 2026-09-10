import countries from 'i18n-iso-countries'
import frLocale from 'i18n-iso-countries/langs/fr.json'
import { City } from 'country-state-city'
import { flag as getEmojiFlag } from 'country-emoji'

// Register French locale for i18n-iso-countries safely
const frData = frLocale.default || frLocale
countries.registerLocale(frData)

// Lazy-loaded Map of cities from country-state-city library
let cityToIsoMap = null

const getCityToIsoMap = () => {
  if (cityToIsoMap) return cityToIsoMap
  cityToIsoMap = new Map()
  try {
    const rawCities = City.getAllCities()
    for (const c of rawCities) {
      const lower = c.name.toLowerCase()
      if (!cityToIsoMap.has(lower)) {
        cityToIsoMap.set(lower, c.countryCode)
      }
    }
  } catch (err) {
    // Fallback empty map if library fails
  }
  return cityToIsoMap
}

const convertIsoToEmoji = (isoCode) => {
  if (!isoCode || isoCode.length !== 2) return null
  return isoCode.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

/**
 * Resolves 2-letter ISO country code strictly using country-state-city & i18n-iso-countries libraries
 */
export const getCountryIso = (city = '', country = '') => {
  const cleanCity = (city || '').trim().toLowerCase()
  const cleanCountry = (country || '').trim()

  // 1. Resolve country via i18n-iso-countries (French then English)
  if (cleanCountry) {
    const isoCode = countries.getAlpha2Code(cleanCountry, 'fr') || countries.getAlpha2Code(cleanCountry, 'en')
    if (isoCode) return isoCode.toUpperCase()
  }

  // 2. Resolve city via country-state-city library
  if (cleanCity) {
    const map = getCityToIsoMap()
    if (map.has(cleanCity)) {
      return map.get(cleanCity)
    }
    const isoCode = countries.getAlpha2Code(cleanCity, 'fr') || countries.getAlpha2Code(cleanCity, 'en')
    if (isoCode) return isoCode.toUpperCase()
  }

  return null
}

/**
 * Returns ISO country flag emoji powered by i18n-iso-countries & country-emoji npm packages
 */
export const getCountryFlag = (city = '', country = '') => {
  const iso = getCountryIso(city, country)
  if (iso) {
    const emoji = convertIsoToEmoji(iso)
    if (emoji) return emoji
  }
  const cleanCountry = (country || '').trim()
  if (cleanCountry) {
    const emoji = getEmojiFlag(cleanCountry)
    if (emoji) return emoji
  }
  return '✈️'
}

/**
 * Smart Date Formatter for Voyages
 */
export const formatVoyageDate = (dateStr) => {
  if (!dateStr) return 'Non spécifié'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24))

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  if (diffDays === 0) {
    return `Aujourd'hui à ${timeStr}`
  } else if (diffDays === 1) {
    return `Demain à ${timeStr}`
  } else if (diffDays === 2) {
    return `Après-demain à ${timeStr}`
  } else if (diffDays > 2 && diffDays <= 7) {
    const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return `${daysFr[d.getDay()]} à ${timeStr}`
  } else {
    const monthsFr = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'sept.', 'oct.', 'nov.', 'déc.']
    const dayNum = String(d.getDate()).padStart(2, '0')
    const monthStr = monthsFr[d.getMonth()]
    const yearStr = d.getFullYear()
    return `${dayNum}-${monthStr}-${yearStr} ${timeStr}`
  }
}
