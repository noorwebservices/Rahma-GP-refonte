/**
 * Security Filter for Messaging
 * Blocks and erases phone numbers and email addresses in chat messages silently.
 */

export const containsPhoneOrEmail = (text) => {
  if (!text || typeof text !== 'string') return { isForbidden: false }

  const cleanText = text.trim()

  // 1. Email check
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
  if (emailRegex.test(cleanText)) {
    return { isForbidden: true, type: 'email' }
  }

  // 2. Phone number patterns
  const phonePatterns = [
    /(?:\+|00)\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/,
    /(?:77|78|76|70|75|33)[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/,
    /0[1-9](?:[\s.-]?\d{2}){4}/,
    /\b\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/,
    /\b\d{8,15}\b/
  ]

  for (const pattern of phonePatterns) {
    if (pattern.test(cleanText)) {
      return { isForbidden: true, type: 'phone' }
    }
  }

  const digitsOnly = cleanText.replace(/\D/g, '')
  if (digitsOnly.length >= 8) {
    return { isForbidden: true, type: 'phone' }
  }

  return { isForbidden: false }
}

export const stripPhoneAndEmail = (text) => {
  if (!text || typeof text !== 'string') return ''
  
  let cleaned = text

  // Strip email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '')

  // Strip phone patterns
  cleaned = cleaned.replace(/(?:\+|00)\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/gi, '')
  cleaned = cleaned.replace(/(?:77|78|76|70|75|33)[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/gi, '')
  cleaned = cleaned.replace(/0[1-9](?:[\s.-]?\d{2}){4}/gi, '')
  cleaned = cleaned.replace(/\b\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/gi, '')

  // If text still contains 8+ digits, strip numbers
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (digitsOnly.length >= 8) {
    cleaned = cleaned.replace(/\d/g, '')
  }

  return cleaned.trim()
}

export default {
  containsPhoneOrEmail,
  stripPhoneAndEmail
}
