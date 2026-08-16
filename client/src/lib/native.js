import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

export async function bootNativeShell() {
  if (!Capacitor.isNativePlatform()) return
  document.documentElement.classList.add('is-native')
  try {
    await StatusBar.setOverlaysWebView({ overlay: true })
    await StatusBar.setStyle({ style: Style.Light })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0B1638' })
    }
  } catch {
    /* plugin missing on web */
  }
  try {
    await Keyboard.setResizeMode({ mode: 'body' })
  } catch {
    /* ignore */
  }
  try {
    await SplashScreen.hide({ fadeOutDuration: 280 })
  } catch {
    /* ignore */
  }
}

export function apiBase() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (Capacitor.isNativePlatform()) {
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    if (host && host !== 'localhost') {
      return `http://${host}:5001/api`
    }
    return Capacitor.getPlatform() === 'android'
      ? 'http://10.0.2.2:5001/api'
      : 'http://127.0.0.1:5001/api'
  }
  return '/api'
}
