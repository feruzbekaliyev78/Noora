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
  const z = {
    forehead: zones?.forehead ?? 0,
    nose: zones?.nose ?? 0,
    cheeks: zones?.cheeks ?? 0,
    chin: zones?.chin ?? 0
  }

  return (
    <div className="face-zones">
      <div className="zone-title">{title}</div>
      <div className="face-map">
        <ZoneBadge label="Лоб" score={z.forehead} className="zone-top" />
        <ZoneBadge label="Нос" score={z.nose} className="zone-center" />
        <ZoneBadge label="Щёки" score={z.cheeks} className="zone-sides" />
        <ZoneBadge label="Подб" score={z.chin} className="zone-bottom" />
        <div className="face-map-outline">👤</div>
      </div>
    </div>
  )
}
