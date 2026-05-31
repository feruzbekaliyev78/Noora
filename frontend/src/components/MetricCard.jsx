import { useEffect, useRef } from 'react'

export default function MetricCard({ label, value, displayValue, delay = 300 }) {
  const barRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${value}%`
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="mc">
      <div className="mc-lbl">{label}</div>
      <div className="mc-bar-bg">
        <div className="mc-bar" ref={barRef} />
      </div>
      <div className="mc-val">
        {displayValue}
        {typeof displayValue === 'number' && <small> %</small>}
      </div>
    </div>
  )
}
