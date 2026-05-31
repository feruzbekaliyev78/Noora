import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useApp } from '../context/AppContext'
import LangToggle from '../components/LangToggle'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'
import { requestCameraStream } from '../hooks/useCamera'

export default function Onboarding() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { setCameraStream, showToast } = useApp()

  const handleStart = async (e) => {
    createRipple(e.currentTarget, e)

    try {
      const stream = await requestCameraStream()
      setCameraStream(stream)
    } catch {
      showToast(t('cameraError'))
    }

    navigate('/camera')
  }

  return (
    <div className="screen-page screen-onboard">
      <LangToggle />
      <div className="b1 blob" />
      <div className="b2 blob" />
      <div className="safe-top" />
      <ScreenHeader title="" fallback="/profile" />
      <div className="ob-content">
        <div className="ob-logo">
          <div className="ob-icon">N</div>
          <div className="ob-name">OORA</div>
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
        <button className="btn" type="button" onClick={handleStart}>{t('startAnalysis')}</button>
        <button className="btn-g" type="button" onClick={() => navigate('/profile')}>{t('hasAccount')}</button>
      </div>
      <div className="safe-bot" />
    </div>
  )
}
