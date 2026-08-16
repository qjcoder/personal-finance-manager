import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LANGS, STRINGS, loadLang, saveLang } from '../data/locales.js'

const Ctx = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(loadLang)

  useEffect(() => {
    saveLang(lang)
    const meta = LANGS.find((item) => item.id === lang) || LANGS[0]
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en'
    document.documentElement.dir = meta.dir
    document.documentElement.dataset.lang = lang
  }, [lang])

  const value = useMemo(() => {
    function t(key, fallback) {
      return STRINGS[lang]?.[key] || STRINGS.en[key] || fallback || key
    }
    function setLang(id) {
      if (LANGS.some((item) => item.id === id)) setLangState(id)
    }
    return { lang, setLang, t, langs: LANGS }
  }, [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n needs I18nProvider')
  return ctx
}
