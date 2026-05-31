import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Splash() {
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2200)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="screen-page screen-splash">
      <div className="b1 blob" />
      <div className="b2 blob" />
      <div className="splash-rings">
        <div className="sring" />
        <div className="sring" />
        <div className="sring" />
      </div>
      <div className="splash-content">
        <div className="splash-logo">NOORA</div>
        <div className="splash-sub">{t('splashSub')}</div>
      </div>
    </div>
  )
}
