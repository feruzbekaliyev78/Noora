import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { getScoreLabel, formatPores, formatTexture } from '../i18n/translations'
import ScoreRing from '../components/ScoreRing'
import MetricCard from '../components/MetricCard'
import TabBar from '../components/TabBar'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'

export default function Result() {
  const navigate = useNavigate()
  const { analysis } = useApp()
  const { t, lang } = useI18n()

  useEffect(() => {
    if (!analysis) navigate('/camera')
  }, [analysis, navigate])

  if (!analysis) return null

  const ageDiff = analysis.ageDiff ?? (analysis.realAge != null ? analysis.realAge - analysis.skinAge : null)

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
                <div className="age-hint">{t('realAge')}: {analysis.realAge}</div>
              </div>
            )}
          </div>
          <div className="metrics">
            <MetricCard label={t('hydration')} value={analysis.hydration} displayValue={analysis.hydration} />
            <MetricCard label={t('tone')} value={analysis.tone} displayValue={analysis.tone} />
            <MetricCard label={t('pores')} value={analysis.poresValue ?? 60} displayValue={formatPores(analysis.pores, lang)} />
            <MetricCard label={t('texture')} value={analysis.textureValue ?? 65} displayValue={formatTexture(analysis.texture, lang)} />
          </div>
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
