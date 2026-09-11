/**
 * Utility to mask and unmask UUIDs in URLs
 */

// Encodes UUID to a clean 22-character base64url string
export function encodeId(id) {
  if (!id || typeof id !== 'string') return id
  const clean = id.replace(/-/g, '')
  if (clean.length === 32 && /^[0-9a-fA-F]+$/.test(clean)) {
    try {
      const bytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16)
      }
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    } catch (e) {
      return clean
    }
  }
  return id
}

// Decodes 22-character base64url string (or 32 hex chars) back to standard 36-char UUID format (8-4-4-4-12)
export function decodeId(masked) {
  if (!masked || typeof masked !== 'string') return masked
  if (masked.includes('-') && masked.length === 36) return masked

  // 22-char base64url string
  if (masked.length === 22 && /^[A-Za-z0-9\-_]+$/.test(masked)) {
    try {
      let b64 = masked.replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4) b64 += '='
      const binary = atob(b64)
      let hex = ''
      for (let i = 0; i < binary.length; i++) {
        hex += binary.charCodeAt(i).toString(16).padStart(2, '0')
      }
      if (hex.length === 32) {
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      }
    } catch (e) {}
  }

  // 32-char hex string
  if (masked.length === 32 && !masked.includes('-') && /^[0-9a-fA-F]+$/.test(masked)) {
    return `${masked.slice(0, 8)}-${masked.slice(8, 12)}-${masked.slice(12, 16)}-${masked.slice(16, 20)}-${masked.slice(20)}`
  }

  return masked
}

export default {
  encodeId,
  decodeId
}
