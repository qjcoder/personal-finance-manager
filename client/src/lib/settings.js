const THEME_KEY = 'pfm-theme-mode'

export const APP_NAME = 'Tarteeb'

export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
]

export function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('pfm-theme')
  if (saved === 'dark') return 'dark'
  return 'light'
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}
