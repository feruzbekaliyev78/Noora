import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('noora-lang') || 'ru')

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'ru' ? 'uz' : 'ru'
      localStorage.setItem('noora-lang', next)
      return next
    })
  }, [])

  const t = useCallback(
    (key, vars) => {
      let str = translations[lang][key] || translations.ru[key] || key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v)
        })
      }
      return str
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
