import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import {
  getScoreLabel,
  formatPores,
  formatTexture,
  formatDarkCircles,
  formatAcne,
  formatWrinkles
} from '../i18n/translations'
import ScoreRing from '../components/ScoreRing'
import MetricCard from '../components/MetricCard'
import FaceZones from '../components/FaceZones'
import TabBar from '../components/TabBar'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { analysis, setAnalysis, profile } = useApp()
  const { t, lang } = useI18n()

  useEffect(() => {
    if (location.state?.result && !analysis) {
      setAnalysis(location.state.result)
    }
  }, [location.state, analysis, setAnalysis])

  useEffect(() => {
    if (!analysis && !location.state?.result) navigate('/camera')
  }, [analysis, location.state, navigate])

  if (!analysis) return null

  const ageDiff = analysis.ageDiff ?? (analysis.realAge != null ? analysis.realAge - analysis.skinAge : null)
  const fromCache = location.state?.fromCache

  const detailedParams = [
    { icon: '🔴', label: t('redness'), value: `${analysis.redness ?? 0}%`, good: (analysis.redness ?? 0) < 30 },
    { icon: '⚫', label: t('darkCircles'), value: formatDarkCircles(analysis.darkCircles, lang) },
    { icon: '🌑', label: t('pigmentation'), value: `${analysis.pigmentation ?? 0}%`, good: (analysis.pigmentation ?? 0) < 20 },
    { icon: '💧', label: t('dehydration'), value: `${analysis.dehydration ?? 0}%`, good: (analysis.dehydration ?? 0) < 30 },
    { icon: '🫧', label: t('oiliness'), value: `${analysis.oiliness ?? 0}%` },
    { icon: '📍', label: t('acne'), value: formatAcne(analysis.acne, lang) },
    { icon: '〰️', label: t('wrinkles'), value: formatWrinkles(analysis.wrinkles, lang) },
    { icon: '🎨', label: t('evenness'), value: `${analysis.evenness ?? 0}%`, good: (analysis.evenness ?? 0) > 70 }
  ]

  return (
    <div className="screen-page screen-result">
      <div className="b1 blob" style={{ opacity: 0.12 }} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="res-scroll">
          <div className="safe-top" />
          <ScreenHeader title={t('skinPassport')} fallback="/camera" />
          <div className="res-top">
            <div>
              <div className="res-lbl">{t('analysisDone')}</div>
              {fromCache && <div className="cache-badge">{t('fromCache')}</div>}
            </div>
            <div style={{ fontSize: '7vw' }}>✨</div>
          </div>
          <div className="score-sec">
            <ScoreRing score={analysis.skinScore} label={t('skinScore')} />
            <div className="score-tag">{getScoreLabel(analysis.skinScore, lang)}</div>
          </div>
          <div className="age-banner">
            <div>
              <div className="al">{t('skinAge')}</div>
              <div className="an">{analysis.skinAge}</div>
              <div className="as2">{t('years')}</div>
            </div>
            {ageDiff != null && (
              <div style={{ textAlign: 'right' }}>
                <div className={`age-pill ${ageDiff <= 0 ? 'care' : ''}`}>
                  {ageDiff > 0 ? t('yearsYounger', { n: ageDiff }) : t('skinNeedsCare')}
                </div>
                <div className="age-hint">{t('realAge')}: {analysis.realAge ?? profile.age}</div>
              </div>
            )}
          </div>
          <div className="metrics">
            <MetricCard label={t('hydration')} value={analysis.hydration} displayValue={analysis.hydration} />
            <MetricCard label={t('tone')} value={analysis.tone} displayValue={analysis.tone} />
            <MetricCard label={t('pores')} value={analysis.poresValue ?? 60} displayValue={formatPores(analysis.pores, lang)} />
            <MetricCard label={t('texture')} value={analysis.textureValue ?? 65} displayValue={formatTexture(analysis.texture, lang)} />
          </div>
          <div className="detailed-section">
            <div className="section-title">{t('detailedAnalysis')}</div>
            <div className="detailed-grid">
              {detailedParams.map((param) => (
                <div key={param.label} className={`detailed-item ${param.good ? 'good' : ''}`}>
                  <span className="detailed-icon">{param.icon}</span>
                  <div>
                    <div className="detailed-label">{param.label}</div>
                    <div className="detailed-value">{param.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <FaceZones zones={analysis.zones} title={t('faceZones')} />
          <button
            className="share-btn"
            onClick={(e) => { createRipple(e.currentTarget, e); navigate('/share') }}
          >
            {t('shareResult')}
          </button>
        </div>
      </div>
      <TabBar />
      <div className="safe-bot" />
    </div>
  )
}
