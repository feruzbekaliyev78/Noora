import { useEffect, useState } from 'react'

const CIRCUMFERENCE = 351.9

export default function ScoreRing({ score, size = '33vw', label = 'SKIN SCORE' }) {
  const [display, setDisplay] = useState(0)
  const [offset, setOffset] = useState(CIRCUMFERENCE)

  useEffect(() => {
    const target = score ?? 0
    const dur = 1400
    const st = performance.now()

    function tick(now) {
      const t = Math.min((now - st) / dur, 1)
      const e = 1 - Math.pow(1 - t, 3)
      const v = Math.round(e * target)
      setDisplay(v)
      setOffset(CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE)
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [score])

  return (
    <div className="score-wrap" style={{ width: size, height: size }}>
      <svg width="100%" height="100%" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <circle
          cx="65" cy="65" r="56" fill="none" stroke="url(#rg)" strokeWidth="9"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BF5AF2" />
            <stop offset="100%" stopColor="#FF375F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score-center">
        <div className="score-n">{display}</div>
        <div className="score-l">{label}</div>
      </div>
    </div>
  )
}
