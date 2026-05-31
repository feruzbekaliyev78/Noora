import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { getScoreLabel, formatPores, formatTexture } from '../i18n/translations'
import { generateShareCard, shareCardImage } from '../utils/generateShareCard'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'

export default function ShareCard() {
  const navigate = useNavigate()
  const { analysis, capturedImage, profile, showToast } = useApp()
  const { t, lang } = useI18n()
  const [cardUrl, setCardUrl] = useState(null)

  useEffect(() => {
    if (!analysis) {
      navigate('/result')
      return
    }
    generateShareCard(analysis, profile, capturedImage, lang).then(setCardUrl)
  }, [analysis, capturedImage, profile, lang, navigate])

  if (!analysis) return null

  const ageDiff = analysis.ageDiff ?? (analysis.realAge != null ? analysis.realAge - analysis.skinAge : null)
  const date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')
  const dashOffset = 182.2 - (analysis.skinScore / 100) * 182.2

  const handleShare = async (e) => {
    createRipple(e.currentTarget, e)
    const url = cardUrl || await generateShareCard(analysis, profile, capturedImage, lang)
    await shareCardImage(url, analysis.skinScore, lang)
    showToast(t('cardReady'))
  }

  const handleDownload = async () => {
    const url = cardUrl || await generateShareCard(analysis, profile, capturedImage, lang)
    const a = document.createElement('a')
    a.href = url
    a.download = 'noora-skin.jpg'
    a.click()
    showToast(t('saved'))
  }

  return (
    <div className="screen-page screen-share">
      <div className="sc-inner">
        <div className="sc-grid" />
        <div className="sc-b1" />
        <div className="sc-b2" />
        <div className="safe-top" />
        <ScreenHeader title={t('shareCard')} fallback="/result" />
        <div className="sc-hdr">
          <div className="sc-logo">
            <div className="sc-logo-box">N</div>
            <div className="sc-logo-name">OORA</div>
          </div>
          <div className="sc-dt">{date}</div>
        </div>
        <div className="sc-avatar">
          {capturedImage ? (
            <img src={capturedImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        <div className="sc-name"><strong>{profile.name}</strong></div>
        <div className="sc-score-row">
          <div style={{ position: 'relative', width: '18vw', height: '18vw' }}>
            <svg width="100%" height="100%" viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="35" cy="35" r="29" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle cx="35" cy="35" r="29" fill="none" stroke="url(#sg3)" strokeWidth="5"
                strokeDasharray="182.2" strokeDashoffset={dashOffset} strokeLinecap="round" />
              <defs>
                <linearGradient id="sg3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BF5AF2" />
                  <stop offset="100%" stopColor="#FF375F" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="sc-big">{analysis.skinScore}</div>
          <div className="sc-score-info">
            <div className="sci-l">{t('skinScore')}</div>
            <div className="sci-v">{getScoreLabel(analysis.skinScore, lang).replace('✦ ', '')}</div>
          </div>
        </div>
        <div className="sc-age-tag">
          {t('skinAgeLabel')}: <strong>{analysis.skinAge} {t('years')}</strong>
          {ageDiff != null && ageDiff > 0 && ` — ${t('lookYounger', { n: ageDiff })}`}
          {ageDiff != null && ageDiff <= 0 && ` — ${t('skinNeedsCare')}`}
        </div>
        <div className="sc-stats">
          <div className="sc-stat"><div className="sc-sv">{analysis.hydration}%</div><div className="sc-sk">{t('hydration').slice(0, 5)}</div></div>
          <div className="sc-stat"><div className="sc-sv">{analysis.tone}%</div><div className="sc-sk">{t('tone').slice(0, 3)}</div></div>
          <div className="sc-stat"><div className="sc-sv">{formatPores(analysis.pores, lang)}</div><div className="sc-sk">{t('pores').slice(0, 4)}</div></div>
          <div className="sc-stat"><div className="sc-sv">{formatTexture(analysis.texture, lang).slice(0, 5)}</div><div className="sc-sk">{t('texture').slice(0, 4)}</div></div>
        </div>
        <div className="sc-cta">{t('checkSkin')} <span>noora.uz</span></div>
      </div>
      <div className="sc-actions">
        <button className="btn" onClick={handleShare}>{t('share')}</button>
        <div className="dl-btn" onClick={handleDownload}>⬇</div>
      </div>
      <div className="safe-bot" />
    </div>
  )
}
