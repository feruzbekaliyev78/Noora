import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import LangToggle from '../components/LangToggle'
import { createRipple } from '../utils/ripple'

export default function Onboarding() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const handleStart = (e) => {
    createRipple(e.currentTarget, e)
    navigate('/camera')
  }

  return (
    <div className="screen-page screen-onboard">
      <LangToggle />
      <div className="b1 blob" />
      <div className="b2 blob" />
      <div className="safe-top" />
      <div style={{ padding: '0 6vw', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="ob-logo">
          <div className="ob-icon">N</div>
          <div className="ob-name">NOORA</div>
        </div>
        <div className="ob-hl">
          {t('onboardingTitle1')}<br />
          {t('onboardingTitle2') && <>{t('onboardingTitle2')}<br /></>}
          <span className="grd ital">{t('onboardingTitleAccent')}</span>
        </div>
        <div className="ob-desc">{t('onboardingDesc')}</div>
        <div className="face-scan">
          <div className="fring" />
          <div className="fring2" />
          <div className="finner">
            🪞
            <div className="scan-line" />
          </div>
        </div>
        <div className="dots">
          <div className="dot on" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <button className="btn" onClick={handleStart}>{t('startAnalysis')}</button>
        <button className="btn-g" type="button">{t('hasAccount')}</button>
      </div>
      <div className="safe-bot" />
    </div>
  )
}
