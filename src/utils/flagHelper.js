import countries from 'i18n-iso-countries'
import frLocale from 'i18n-iso-countries/langs/fr.json'
import { City } from 'country-state-city'
import { flag as getEmojiFlag } from 'country-emoji'

// Register French locale for i18n-iso-countries safely
const frData = frLocale.default || frLocale
countries.registerLocale(frData)

// Well-known major cities map to guarantee correct ISO resolution (e.g., Paris -> FR, Dakar -> SN)
const knownCityIsoMap = new Map([
  // France
  ['paris', 'FR'],
  ['lyon', 'FR'],
  ['marseille', 'FR'],
  ['toulouse', 'FR'],
  ['bordeaux', 'FR'],
  ['nice', 'FR'],
  ['nantes', 'FR'],
  ['strasbourg', 'FR'],
  ['montpellier', 'FR'],
  ['lille', 'FR'],
  ['rennes', 'FR'],
  ['reims', 'FR'],
  ['le havre', 'FR'],
  ['saint-étienne', 'FR'],
  ['toulon', 'FR'],
  ['grenoble', 'FR'],
  ['dijon', 'FR'],

  // Sénégal
  ['dakar', 'SN'],
  ['thiès', 'SN'],
  ['thies', 'SN'],
  ['saint-louis', 'SN'],
  ['ziguinchor', 'SN'],
  ['touba', 'SN'],
  ['mbour', 'SN'],
  ['kaolack', 'SN'],
  ['rufisque', 'SN'],
  ['kolda', 'SN'],
  ['tamba', 'SN'],
  ['tambacounda', 'SN'],
  ['diourbel', 'SN'],
  ['louga', 'SN'],
  ['fatick', 'SN'],

  // Côte d'Ivoire
  ['abidjan', 'CI'],
  ['yamoussoukro', 'CI'],
  ['bouaké', 'CI'],
  ['bouake', 'CI'],

  // Mali
  ['bamako', 'ML'],
  ['sikasso', 'ML'],
  ['mopti', 'ML'],

  // Guinée
  ['conakry', 'GN'],

  // Cameroun
  ['douala', 'CM'],
  ['yaoundé', 'CM'],
  ['yaounde', 'CM'],

  // Maroc
  ['casablanca', 'MA'],
  ['rabat', 'MA'],
  ['marrakech', 'MA'],
  ['tanger', 'MA'],
  ['fes', 'MA'],
  ['fès', 'MA'],

  // Royaume-Uni
  ['londres', 'GB'],
  ['london', 'GB'],

  // États-Unis
  ['new york', 'US'],
  ['washington', 'US'],

  // Canada
  ['montréal', 'CA'],
  ['montreal', 'CA'],
  ['toronto', 'CA'],

  // Belgique
  ['bruxelles', 'BE'],
  ['brussels', 'BE'],

  // Suisse
  ['genève', 'CH'],
  ['geneve', 'CH'],
  ['geneva', 'CH'],
  ['zurich', 'CH'],
  ['zürich', 'CH'],

  // Italie
  ['milan', 'IT'],
  ['milano', 'IT'],
  ['rome', 'IT'],
  ['roma', 'IT'],

  // Espagne
  ['madrid', 'ES'],
  ['barcelone', 'ES'],
  ['barcelona', 'ES'],

  // Portugal
  ['lisbonne', 'PT'],
  ['lisbon', 'PT'],
  ['porto', 'PT']
])

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

  // 1. Known major cities map override (fixes Abidjan -> CI, Dakar -> SN, Paris -> FR, etc.)
  if (cleanCity && knownCityIsoMap.has(cleanCity)) {
    return knownCityIsoMap.get(cleanCity)
  }

  // 2. Resolve city via country-state-city library
  if (cleanCity) {
    const map = getCityToIsoMap()
    if (map.has(cleanCity)) {
      return map.get(cleanCity)
    }
  }

  // 3. Resolve country via i18n-iso-countries (French then English)
  if (cleanCountry) {
    const isoCode = countries.getAlpha2Code(cleanCountry, 'fr') || countries.getAlpha2Code(cleanCountry, 'en')
    if (isoCode) return isoCode.toUpperCase()
  }

  // 4. Fallback resolve city directly via i18n-iso-countries if city name matches a country
  if (cleanCity) {
    const isoCode = countries.getAlpha2Code(cleanCity, 'fr') || countries.getAlpha2Code(cleanCity, 'en')
    if (isoCode) return isoCode.toUpperCase()
  }

  return null
}

/**
 * Returns the localized French country name for a given city & country
 */
export const getDisplayCountry = (city = '', country = '') => {
  const iso = getCountryIso(city, country)
  if (iso) {
    const frName = countries.getName(iso, 'fr')
    if (frName) return frName
  }
  return country || city || ''
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
    const monthsFr = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
    const dayNum = String(d.getDate()).padStart(2, '0')
    const monthStr = monthsFr[d.getMonth()]
    const yearStr = d.getFullYear()
    return `${dayNum} ${monthStr} ${yearStr} à ${timeStr}`
  }
}

/**
 * Explicit Date and Time Formatter (e.g. 11 sept. 2026 à 19:45)
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Non spécifié'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  const monthsFr = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  const dayNum = String(d.getDate()).padStart(2, '0')
  const monthStr = monthsFr[d.getMonth()]
  const yearStr = d.getFullYear()

  return `${dayNum} ${monthStr} ${yearStr} à ${timeStr}`
}

/**
 * Returns formatted French label with emoji for parcel tracking status
 */
export const getColisStatutLabel = (statut) => {
  if (!statut) return 'Statut inconnu'
  const map = {
    'demande_envoyee': '📩 Demande envoyée',
    'en_attente': '⏳ En attente de confirmation',
    'acceptee': '✅ Demande acceptée',
    'colis_depose': '📍 Colis déposé au point relais',
    'colis_pris_en_charge': '🧳 Colis pris en charge par le GP',
    'en_transit': '✈️ En transit / En vol',
    'en_cours': '✈️ En cours d\'acheminement',
    'arrive': '🛬 Arrivé au point de destination',
    'livre': '🎁 Livré au destinataire',
    'livree': '🎁 Livré au destinataire',
    'annulee': '❌ Demande annulée',
    'refusee': '❌ Demande refusée'
  }
  return map[statut] || statut
}

/**
 * Helper to match category names with suitable emoji icons
 */
export const getCategoryIcon = (name = '') => {
  if (!name) return '📦'
  const lower = name.toLowerCase()
  if (lower.includes('perruque') || lower.includes('pérruque') || lower.includes('cheveux') || lower.includes('tissage')) return '💇‍♀️'
  if (lower.includes('basket') || lower.includes('basquet') || lower.includes('sneaker')) return '👟'
  if (lower.includes('sac à main') || lower.includes('sac a main') || lower.includes('handbag')) return '👜'
  if (lower.includes('enveloppe') || lower.includes('pli')) return '✉️'
  if (lower.includes('vêtement') || lower.includes('vetement') || lower.includes('tissu') || lower.includes('habit') || lower.includes('laine')) return '👗'
  if (lower.includes('téléphone') || lower.includes('telephone') || lower.includes('électronique') || lower.includes('electronique') || lower.includes('high-tech') || lower.includes('ordinateur') || lower.includes('tablette')) return '📱'
  if (lower.includes('document') || lower.includes('papier') || lower.includes('lettre')) return '📄'
  if (lower.includes('cosmétique') || lower.includes('cosmetique') || lower.includes('soin') || lower.includes('beauté')) return '💄'
  if (lower.includes('médicament') || lower.includes('medicament') || lower.includes('ordonnance') || lower.includes('santé')) return '💊'
  if (lower.includes('bijou') || lower.includes('valeur') || lower.includes('or')) return '💎'
  if (lower.includes('nourriture') || lower.includes('épice') || lower.includes('epice') || lower.includes('aliment') || lower.includes('sec')) return '🍲'
  if (lower.includes('livre') || lower.includes('scolaire') || lower.includes('fourniture')) return '📚'
  if (lower.includes('cadeau')) return '🎁'
  if (lower.includes('chaussure') || lower.includes('sac')) return '👠'
  return '📦'
}

/**
 * Checks if a category name is an electronic device (which applies fixed prix_objet tariff)
 */
export const isElectronicType = (name = '') => {
  if (!name) return false
  const lower = name.toLowerCase()
  return lower.includes('électronique') || lower.includes('electronique') || lower.includes('téléphone') || lower.includes('telephone') || lower.includes('high-tech') || lower.includes('hightech') || lower.includes('ordinateur') || lower.includes('tablette')
}

/**
 * Checks if two date ranges [startA, endA] and [startB, endB] overlap.
 * Returns true if there is an overlap.
 */
export const checkDateOverlap = (startA, endA, startB, endB) => {
  if (!startA || !endA || !startB || !endB) return false
  const sA = new Date(startA).getTime()
  const eA = new Date(endA).getTime()
  const sB = new Date(startB).getTime()
  const eB = new Date(endB).getTime()

  if (isNaN(sA) || isNaN(eA) || isNaN(sB) || isNaN(eB)) return false

  return sA < eB && eA > sB
}

