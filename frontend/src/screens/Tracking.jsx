import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import TabBar from '../components/TabBar'

const WEEK_LABELS = ['1', '2', '3', '4', '5', '6']

export default function Tracking() {
  const navigate = useNavigate()
  const { history, analysis } = useApp()
  const { t } = useI18n()

  const scores = WEEK_LABELS.map((_, i) => {
    const entry = history[i]
    return entry?.skinScore ?? (i === WEEK_LABELS.length - 1 && analysis ? analysis.skinScore : 0)
  })

  const maxScore = Math.max(...scores, 1)
  const current = scores[scores.length - 1] || analysis?.skinScore || 0
  const weekAgo = scores[scores.length - 2] || current

  return (
    <div className="screen-page screen-tracking">
      <div className="b1 blob" style={{ opacity: 0.1 }} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="tr-scroll">
          <div className="safe-top" />
          <div className="tr-title">{t('trackingTitle')}</div>
          <div className="tr-sub">{t('trackingSub')}</div>
          <div className="tr-chart">
            {scores.map((score, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  className={`tr-bar ${score > 0 ? 'on' : ''}`}
                  style={{ height: `${(score / maxScore) * 100}%`, minHeight: score > 0 ? '4vw' : '2vw' }}
                />
                <div className="tr-bar-lbl">{WEEK_LABELS[i]}</div>
              </div>
            ))}
          </div>
          <div className="tr-card">
            <div className="tr-card-title">{t('weeklySelfie')}</div>
            <button className="btn" onClick={() => navigate('/camera')}>{t('startAnalysis')}</button>
          </div>
          <div className="tr-compare">
            <div className="tr-compare-item">
              <div className="tr-compare-val">{weekAgo || '—'}</div>
              <div className="tr-compare-lbl">{t('weekAgo')}</div>
            </div>
            <div style={{ fontSize: '6vw', color: 'var(--muted)' }}>→</div>
            <div className="tr-compare-item">
              <div className="tr-compare-val">{current || '—'}</div>
              <div className="tr-compare-lbl">{t('now')}</div>
            </div>
          </div>
        </div>
      </div>
      <TabBar />
      <div className="safe-bot" />
    </div>
  )
}
