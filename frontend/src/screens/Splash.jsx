import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { isProfileComplete } from '../context/AppContext'

export default function Splash() {
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem('noora-profile')
        const profile = raw ? JSON.parse(raw) : {}
        navigate(isProfileComplete(profile) ? '/onboarding' : '/profile')
      } catch {
        navigate('/profile')
      }
    }, 2200)
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
