import { useI18n } from '../context/I18nContext'

export default function LangToggle() {
  const { lang, toggleLang } = useI18n()

  return (
    <button className="lang-toggle" onClick={toggleLang} type="button">
      {lang === 'ru' ? 'UZ' : 'RU'}
    </button>
  )
}
