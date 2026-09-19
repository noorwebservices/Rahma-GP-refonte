// Utilitaires pays : drapeau emoji + nom localisé à partir d'un code ISO 3166-1 alpha-2.

export function countryFlag(code) {
  if (!code || typeof code !== 'string' || code.length !== 2) return '🌍'
  try {
    const cc = code.toUpperCase()
    const codePoints = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65))
    return String.fromCodePoint(...codePoints)
  } catch {
    return '🌍'
  }
}

let _displayNames = null
function displayNames() {
  if (_displayNames === null) {
    try {
      _displayNames = new Intl.DisplayNames(['fr'], { type: 'region' })
    } catch {
      _displayNames = false
    }
  }
  return _displayNames
}

export function countryName(code, fallback = null) {
  if (!code) return fallback || 'Inconnu'
  const dn = displayNames()
  if (dn) {
    try {
      return dn.of(code.toUpperCase()) || fallback || code
    } catch {
      return fallback || code
    }
  }
  return fallback || code
}
