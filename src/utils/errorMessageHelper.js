/**
 * Helper utility to translate backend API error messages and validation errors into French.
 */
export const translateErrorMessage = (err) => {
  if (!err) return "Une erreur est survenue."

  // 1. If backend returned Laravel validation errors dictionary ({ errors: { field: ["error..."] } })
  if (err.errors && typeof err.errors === 'object') {
    const messages = []
    Object.keys(err.errors).forEach(field => {
      const fieldErrors = err.errors[field]
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(msg => messages.push(translateSingleString(msg)))
      } else if (typeof fieldErrors === 'string') {
        messages.push(translateSingleString(fieldErrors))
      }
    })
    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  // 2. If message or error string exists
  const rawMsg = err.message || err.error || (typeof err === 'string' ? err : '')
  if (rawMsg) {
    return translateSingleString(rawMsg)
  }

  return "Une erreur est survenue lors du traitement."
}

const translateSingleString = (msg) => {
  if (!msg || typeof msg !== 'string') return "Une erreur est survenue."

  const lower = msg.toLowerCase().trim()

  if (lower.includes('mot de passe') && lower.includes('required')) {
    return 'Le mot de passe est obligatoire.'
  }
  if (lower.includes('password') && lower.includes('required')) {
    return 'Le mot de passe est obligatoire.'
  }
  if (lower.includes('telephone') && lower.includes('required')) {
    return 'Le numéro de téléphone est obligatoire.'
  }
  if (lower.includes('phone') && lower.includes('required')) {
    return 'Le numéro de téléphone est obligatoire.'
  }
  if (lower.includes('nom') && lower.includes('required')) {
    return 'Le nom est obligatoire.'
  }
  if (lower.includes('prenom') && lower.includes('required')) {
    return 'Le prénom est obligatoire.'
  }
  if (lower.includes('email') && lower.includes('required')) {
    return "L'adresse email est obligatoire."
  }
  if (lower.includes('email') && lower.includes('taken')) {
    return 'Cette adresse email est déjà associée à un compte.'
  }
  if (lower.includes('telephone') && lower.includes('taken')) {
    return 'Ce numéro de téléphone est déjà associé à un compte.'
  }
  if (lower.includes('credentials') || lower.includes('match our records') || lower.includes('invalid credentials')) {
    return 'Identifiants incorrects. Veuillez vérifier votre téléphone/email ou votre mot de passe.'
  }
  if (lower.includes('unauthenticated') || lower.includes('unauthorized')) {
    return 'Veuillez vous connecter pour continuer.'
  }
  if (lower.includes('given data was invalid')) {
    return 'Les informations saisies sont invalides. Veuillez vérifier les champs.'
  }
  if (lower.includes('confirmation') && lower.includes('match')) {
    return 'La confirmation du mot de passe ne correspond pas.'
  }
  if (lower.includes('at least') && lower.includes('character')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  }

  return msg
}

export default {
  translateErrorMessage
}
