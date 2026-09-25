// Mise à jour dynamique des balises SEO à chaque changement de page (SPA).
// Titre, meta description, canonical et Open Graph sont synchronisés avec la route.

const SITE_NAME = 'Rahma Delivery'
const ORIGIN = 'https://rahmadelivery.com'
const DEFAULT_DESCRIPTION =
  "Rahma Delivery (Rahma GP) met en relation expéditeurs et voyageurs de confiance pour l'envoi et le transport international de colis, rapidement et à petit prix. Suivi en temps réel."

function upsertMeta(selector, attr, key, content) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Applique les métadonnées SEO d'une page.
 * @param {{title?: string, description?: string, path?: string, noindex?: boolean}} meta
 */
export function applySeo(meta = {}) {
  const title = meta.title ? `${meta.title} | ${SITE_NAME}` : `${SITE_NAME} — Envoi de colis international avec des voyageurs (GP) de confiance`
  const description = meta.description || DEFAULT_DESCRIPTION
  const url = ORIGIN + (meta.path || '/')

  if (typeof document !== 'undefined') {
    document.title = title
  }

  upsertMeta('meta[name="description"]', 'name', 'description', description)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  upsertMeta('meta[name="robots"]', 'name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  upsertCanonical(url)
}

// Métadonnées par nom de route (pages publiques). Les zones privées passent en noindex.
export const ROUTE_SEO = {
  portail: {
    title: 'Envoi de colis international avec des voyageurs de confiance',
    description: DEFAULT_DESCRIPTION,
  },
  register: {
    title: "Inscription — Devenez expéditeur ou voyageur (GP)",
    description:
      "Créez votre compte Rahma Delivery en quelques minutes pour envoyer vos colis à l'international ou devenir voyageur (GP) et rentabiliser vos trajets.",
  },
  login: {
    title: 'Connexion',
    description: 'Connectez-vous à votre espace Rahma Delivery pour envoyer et suivre vos colis.',
  },
  'voyages-publics': {
    title: 'Voyages disponibles — Trouvez un GP pour votre colis',
    description:
      "Consultez les voyages disponibles sur Rahma Delivery et trouvez un voyageur (GP) de confiance pour acheminer votre colis à l'international. Prix au kilo, capacité et notes des voyageurs.",
  },
  'comment-ca-marche': {
    title: 'Comment ça marche — Envoyer un colis ou devenir GP',
    description:
      "Découvrez comment envoyer un colis avec un voyageur (GP) de confiance sur Rahma Delivery, ou comment devenir voyageur et rentabiliser vos trajets. Le fonctionnement en 4 étapes.",
  },
  faq: {
    title: 'FAQ — Questions fréquentes sur l\'envoi de colis et les GP',
    description:
      "Réponses aux questions fréquentes sur Rahma Delivery : envoyer un colis, prix, paiement sécurisé, devenir voyageur (GP), suivi de colis, objets autorisés et pays desservis.",
  },
}
