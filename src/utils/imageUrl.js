// Construit une URL d'image absolue et servable à partir de ce que renvoie l'API.
//
// - null / vide            -> null
// - déjà une URL / data:   -> renvoyée telle quelle (cas normal désormais côté API)
// - chemin relatif         -> préfixée avec l'origine du backend (dérivée de VITE_API_BASE_URL)
//
// L'origine est déduite de VITE_API_BASE_URL en retirant le suffixe "/api",
// afin de ne jamais coder en dur "localhost".

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://app.rahmadelivery.com/api'

// Origine du serveur (sans le "/api" ni slash final) : ex. https://app.rahmadelivery.com
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

export function formatImageUrl(url) {
  if (!url) return null

  if (/^(https?:\/\/|data:)/i.test(url)) {
    return url
  }

  const clean = String(url).replace(/^\//, '')

  if (clean.startsWith('storage/')) {
    return `${SERVER_ORIGIN}/${clean}`
  }

  return `${SERVER_ORIGIN}/storage/${clean}`
}

export default formatImageUrl
