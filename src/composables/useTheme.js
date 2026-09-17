import { ref } from 'vue'

const isDark = ref(false)
let isInitialized = false

export function useTheme() {
  const initTheme = () => {
    if (isInitialized) return

    const savedTheme = localStorage.getItem('rahma_theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()
    isInitialized = true
  }

  const applyTheme = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (isDark.value) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('rahma_theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  const setTheme = (dark) => {
    isDark.value = !!dark
    localStorage.setItem('rahma_theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  }
}
