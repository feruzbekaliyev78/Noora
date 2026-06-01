import { useI18n } from '../context/I18nContext'

function zoneColor(score) {
  if (score >= 80) return '#34C759'
  if (score >= 60) return '#FFD60A'
  return '#FF375F'
}

function ZoneBadge({ label, score, className }) {
  const color = zoneColor(score)
  return (
    <div className={`zone-badge ${className}`} style={{ borderColor: color, color }}>
      <span className="zone-badge-label">{label}</span>
      <span className="zone-badge-score">{score}</span>
    </div>
  )
}

export default function FaceZones({ zones, title }) {
  const { t } = useI18n()

  const z = {
    forehead: zones?.forehead ?? 0,
    nose: zones?.nose ?? 0,
    cheeks: zones?.cheeks ?? 0,
    chin: zones?.chin ?? 0
  }

  const hasData = [z.forehead, z.nose, z.cheeks, z.chin].some(v => v > 0)
  if (!hasData) return null

  return (
    <div className="face-zones">
      <div className="zone-title">{title}</div>
      <div className="face-map">
        <ZoneBadge label={t('zoneForehead')} score={z.forehead} className="zone-top" />
        <ZoneBadge label={t('zoneCheek')} score={z.cheeks} className="zone-left" />
        <ZoneBadge label={t('zoneCheek')} score={z.cheeks} className="zone-right" />
        <ZoneBadge label={t('zoneNose')} score={z.nose} className="zone-nose" />
        <ZoneBadge label={t('zoneChin')} score={z.chin} className="zone-bottom" />
        <div className="face-map-outline">👤</div>
      </div>
    </div>
  )
}
