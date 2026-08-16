import { Languages } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'

export default function LanguageSwitch({ tone = 'light' }) {
  const { lang, setLang, langs, t } = useI18n()
  const dark = tone === 'dark'

  return (
    <label className={dark ? 'lang-switch is-dark' : 'lang-switch'} title={t('language')}>
      <Languages size={16} strokeWidth={2.25} aria-hidden="true" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t('language')}
      >
        {langs.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
