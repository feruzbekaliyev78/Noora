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
  if (!zones) return null

  return (
    <div className="face-zones">
      <div className="zone-title">{title}</div>
      <div className="face-map">
        <ZoneBadge label="Лоб" score={zones.forehead} className="zone-top" />
        <ZoneBadge label="Нос" score={zones.nose} className="zone-center" />
        <ZoneBadge label="Щёки" score={zones.cheeks} className="zone-sides" />
        <ZoneBadge label="Подб" score={zones.chin} className="zone-bottom" />
        <div className="face-map-outline">👤</div>
      </div>
    </div>
  )
}
