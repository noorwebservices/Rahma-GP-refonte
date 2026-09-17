import { ref, computed } from 'vue'
import fr from '@/locales/fr.js'
import en from '@/locales/en.js'

const translations = { fr, en }
const currentLang = ref('fr')
let isInitialized = false

export function useI18n() {
  const initLang = () => {
    if (isInitialized) return
    const savedLang = localStorage.getItem('rahma_lang')
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      currentLang.value = savedLang
    } else {
      // Auto-detect browser language if available
      const browserLang = navigator.language || navigator.userLanguage || ''
      if (browserLang.toLowerCase().startsWith('en')) {
        currentLang.value = 'en'
      } else {
        currentLang.value = 'fr'
      }
    }
    isInitialized = true
  }

  const setLanguage = (lang) => {
    if (lang === 'fr' || lang === 'en') {
      currentLang.value = lang
      localStorage.setItem('rahma_lang', lang)
    }
  }

  const toggleLanguage = () => {
    const nextLang = currentLang.value === 'fr' ? 'en' : 'fr'
    setLanguage(nextLang)
  }

  const t = (key, fallbackOrParams = {}, defaultFallback = '') => {
    initLang()
    let params = {}
    let fallbackText = typeof fallbackOrParams === 'string' ? fallbackOrParams : defaultFallback

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null && !Array.isArray(fallbackOrParams)) {
      params = fallbackOrParams
    }

    const dict = translations[currentLang.value] || translations.fr
    const keys = key.split('.')
    let result = dict

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // Fallback to FR if key not found in active lang
        let fallback = translations.fr
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk]
          } else {
            return fallbackText || key
          }
        }
        result = fallback
        break
      }
    }

    if (typeof result === 'string') {
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(paramKey => {
          result = result.replaceAll(`{${paramKey}}`, params[paramKey])
        })
      }
      return result
    }

    return result || fallbackText || key
  }

  const te = (key) => {
    if (!key || typeof key !== 'string') return false
    initLang()
    const dict = translations[currentLang.value] || translations.fr
    const keys = key.split('.')
    let result = dict
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return false
      }
    }
    return typeof result === 'string'
  }

  return {
    currentLang,
    initLang,
    setLanguage,
    toggleLanguage,
    t,
    te
  }
}
