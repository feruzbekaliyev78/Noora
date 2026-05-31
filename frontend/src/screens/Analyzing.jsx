import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { analyzeSkin } from '../services/api'
import { saveAnalysis } from '../services/firebase'
import { saveAnalysisCache } from '../services/analysisCache'
import { loadImageElement } from '../utils/image'
import ScreenHeader from '../components/ScreenHeader'

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5']
const MIN_ANIMATION_MS = 3600

export default function Analyzing() {
  const navigate = useNavigate()
  const location = useLocation()
  const { capturedImage, setCapturedImage, setAnalysis, addToHistory, userId, profile, showToast } = useApp()
  const { t } = useI18n()
  const [activeStep, setActiveStep] = useState(-1)
  const [doneSteps, setDoneSteps] = useState([])
  const startedRef = useRef(false)

  const image = capturedImage || location.state?.capturedImage

  useEffect(() => {
    if (!image) {
      navigate('/camera', { replace: true })
      return
    }
    if (startedRef.current) return
    startedRef.current = true

    if (!capturedImage) {
      setCapturedImage(image)
    }

    let cancelled = false

    STEPS.forEach((_, i) => {
      setTimeout(() => !cancelled && setActiveStep(i), 400 + i * 500)
      setTimeout(() => {
        if (cancelled) return
        setActiveStep(prev => (prev === i ? -1 : prev))
        setDoneSteps(prev => [...prev, i])
      }, 850 + i * 500)
    })

    const minDelay = new Promise(resolve => setTimeout(resolve, MIN_ANIMATION_MS))
    const analysisPromise = analyzeSkin(image)
      .then(async (data) => {
        const realAge = profile.age ?? null
        const enriched = {
          ...data,
          realAge,
          ageDiff: realAge != null ? realAge - data.skinAge : null,
          userName: profile.name,
          userAge: profile.age
        }

        try {
          const imageElement = await loadImageElement(image)
          await saveAnalysisCache(userId, imageElement, enriched, profile)
        } catch (err) {
          console.warn('Cache save failed:', err)
        }

        saveAnalysis(userId, enriched).catch(() => {})
        return enriched
      })
      .catch(err => {
        console.error(err)
        return null
      })

    Promise.all([minDelay, analysisPromise]).then(([, data]) => {
      if (cancelled) return
      if (data) {
        setAnalysis(data)
        addToHistory(data)
        navigate('/result')
      } else {
        showToast(t('analyzeError'))
        navigate('/camera')
      }
    })

    return () => { cancelled = true }
  }, [image, capturedImage, navigate, setCapturedImage, setAnalysis, addToHistory, userId, profile, showToast, t])

  return (
    <div className="screen-page screen-analyzing">
      <div className="b1 blob" />
      <div className="b2 blob" />
      <div className="safe-top" />
      <ScreenHeader fallback="/camera" />
      <div className="az-title" style={{ whiteSpace: 'pre-line' }}>{t('analyzingTitle')}</div>
      <div className="az-ring">
        <svg width="100%" height="100%" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="80" cy="80" r="70" fill="none" stroke="url(#ag)" strokeWidth="8"
            strokeDasharray="439.8" strokeDashoffset="330" strokeLinecap="round" />
          <defs>
            <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BF5AF2" />
              <stop offset="100%" stopColor="#FF375F" />
            </linearGradient>
          </defs>
        </svg>
        <div className="az-icon">🔬</div>
      </div>
      <div className="steps">
        {STEPS.map((key, i) => (
          <div
            key={key}
            className={`step ${doneSteps.includes(i) ? 'done' : ''} ${activeStep === i ? 'active' : ''}`}
          >
            <div className="step-dot">{doneSteps.includes(i) ? '✓' : i + 1}</div>
            {t(key)}
          </div>
        ))}
      </div>
      <div className="safe-bot" />
    </div>
  )
}
