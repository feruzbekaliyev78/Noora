import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { captureFromVideo, loadImageElement } from '../utils/image'
import { initFaceDetector, validateFrame } from '../utils/cameraValidator'
import { loadFaceModels } from '../utils/faceRecognition'
import { checkCache } from '../services/analysisCache'
import ScreenHeader from '../components/ScreenHeader'

const EMPTY_VALIDATION = {
  lightOk: false,
  faceOk: false,
  noMakeup: false,
  foreheadOk: false,
  allGood: false
}

async function getCameraStream(facingMode = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API unavailable')
  }

  const attempts = [
    { video: { facingMode: { ideal: facingMode } }, audio: false },
    { video: { facingMode }, audio: false },
    { video: true, audio: false }
  ]

  let lastError
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}

async function playVideoElement(video) {
  video.muted = true
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    await video.play()
    return
  }

  await new Promise((resolve, reject) => {
    video.addEventListener('loadedmetadata', () => {
      video.play().then(resolve).catch(reject)
    }, { once: true })
  })
}

export default function Camera() {
  const navigate = useNavigate()
  const { takeCameraStream, setCapturedImage, setAnalysis, profile, showToast } = useApp()
  const { t } = useI18n()

  const videoRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)
  const facingRef = useRef('user')

  const [ready, setReady] = useState(false)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [validation, setValidation] = useState(EMPTY_VALIDATION)
  const [checkingCache, setCheckingCache] = useState(false)

  const validatingRef = useRef(false)

  const canSnap = ready && validation.allGood && !capturing && !checkingCache

  const attachStream = useCallback(async (stream) => {
    const video = videoRef.current
    if (!video || !stream) return false

    streamRef.current = stream
    video.srcObject = stream

    try {
      await playVideoElement(video)
      setReady(true)
      return true
    } catch (err) {
      console.error('video.play() failed:', err)
      setReady(false)
      return false
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null

    const video = videoRef.current
    if (video) video.srcObject = null

    setReady(false)
    setValidation(EMPTY_VALIDATION)
  }, [])

  const startCamera = useCallback(async (facingMode = facingRef.current) => {
    stopCamera()
    facingRef.current = facingMode
    try {
      const stream = await getCameraStream(facingMode)
      await attachStream(stream)
    } catch (err) {
      console.error('getUserMedia failed:', err)
      showToast(t('cameraError'))
    }
  }, [attachStream, stopCamera, showToast, t])

  const bindVideoRef = useCallback((node) => {
    videoRef.current = node
    if (node && streamRef.current) {
      attachStream(streamRef.current)
    }
  }, [attachStream])

  const flipCamera = () => {
    const next = facingRef.current === 'user' ? 'environment' : 'user'
    startCamera(next)
  }

  const openGallery = () => {
    fileRef.current?.click()
  }

  const processCapture = useCallback(async (image) => {
    setCapturedImage(image)
    stopCamera()
    setCheckingCache(true)

    try {
      const modelsReady = await loadFaceModels().catch(() => false)

      if (modelsReady) {
        try {
          const imageElement = await loadImageElement(image)
          const cached = await checkCache(imageElement)

          if (cached) {
            const enriched = {
              ...cached,
              realAge: profile.age ?? null,
              ageDiff: profile.age != null ? profile.age - cached.skinAge : null
            }
            setAnalysis(enriched)
            navigate('/result', { state: { result: enriched, fromCache: true } })
            return
          }
        } catch (err) {
          console.warn('Face-api cache check skipped:', err)
        }
      }
    } catch (err) {
      console.warn('Cache check failed, continuing to analysis:', err)
    } finally {
      setCheckingCache(false)
    }

    navigate('/analyzing', { state: { capturedImage: image } })
  }, [navigate, profile.age, setAnalysis, setCapturedImage, stopCamera])

  const handleGallery = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => processCapture(reader.result)
    reader.onerror = () => showToast(t('galleryError'))
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    initFaceDetector().catch(err => console.warn('Face detector preload failed:', err))
    loadFaceModels().catch(err => console.warn('Face models preload failed:', err))

    const pendingStream = takeCameraStream()
    if (pendingStream) {
      streamRef.current = pendingStream
      if (videoRef.current) attachStream(pendingStream)
    } else {
      startCamera('user')
    }

    return () => stopCamera()
  }, [takeCameraStream, attachStream, startCamera, stopCamera])

  useEffect(() => {
    if (!ready) return undefined

    let cancelled = false

    const runValidation = async () => {
      const video = videoRef.current
      if (!video?.videoWidth || cancelled || validatingRef.current) return

      validatingRef.current = true
      try {
        const result = await validateFrame(video)
        if (!cancelled) setValidation(result)
      } finally {
        validatingRef.current = false
      }
    }

    runValidation()
    const interval = setInterval(runValidation, 500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [ready])

  const snap = () => {
    if (!canSnap || !videoRef.current) return

    const video = videoRef.current
    setCapturing(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const image = captureFromVideo(video)
    setCapturing(false)
    processCapture(image)
  }

  return (
    <div className="screen-page">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleGallery} />
      <div className="b3 blob" />
      <div className="safe-top" />
      <div className="cam-wrap">
        <ScreenHeader
          title={t('scanning')}
          fallback="/onboarding"
          onBack={() => { stopCamera(); navigate('/onboarding') }}
          right={<div className="icon-btn" onClick={() => setShowTips(true)}>ℹ</div>}
        />
        <div className="vf">
          <video ref={bindVideoRef} className="cam-video" playsInline muted autoPlay />
          {!ready && (
            <div className="cam-loading-overlay" aria-hidden="true">
              <div className="cam-video-placeholder">👤</div>
              <div className="oval">
                👤
                <div className="beam" />
              </div>
            </div>
          )}
          <div className={`vfc tl ${validation.allGood ? 'ready' : ''}`} />
          <div className={`vfc tr ${validation.allGood ? 'ready' : ''}`} />
          <div className={`vfc bl ${validation.allGood ? 'ready' : ''}`} />
          <div className={`vfc br ${validation.allGood ? 'ready' : ''}`} />
          <div className="chips">
            <div className={`chip ${validation.lightOk ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />💡 {validation.lightOk ? t('lightGood') : t('lightBad')}
            </div>
            <div className={`chip ${validation.faceOk ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />👁 {validation.faceOk ? t('lookGood') : t('faceNotFound')}
            </div>
            <div className={`chip ${validation.foreheadOk ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />✂️ {validation.foreheadOk ? t('foreheadGood') : t('foreheadBad')}
            </div>
            <div className={`chip ${validation.noMakeup ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />🚫 {validation.noMakeup ? t('makeupGood') : t('makeupBad')}
            </div>
          </div>
        </div>
        <div className="tips">
          <div className="tip"><div className="tip-ico">💡</div>{t('tipLight')}</div>
          <div className="tip"><div className="tip-ico">🚫</div>{t('tipNoMakeup')}</div>
          <div className="tip"><div className="tip-ico">👁</div>{t('tipLook')}</div>
          <div className="tip"><div className="tip-ico">✂️</div>{t('tipHair')}</div>
        </div>
        <div className="shutter-row">
          <div className="shutter-side" onClick={openGallery}>🖼</div>
          <div
            className={`shutter ${canSnap ? '' : 'disabled'}`}
            style={{ opacity: canSnap ? 1 : 0.4 }}
            onClick={snap}
          >
            📸
          </div>
          <div className="shutter-side" onClick={flipCamera}>🔄</div>
        </div>
      </div>
      <div className="safe-bot" />
      <div className={`flash ${flash ? 'go' : ''}`} />
      {showTips && (
        <div className="tips-modal" onClick={() => setShowTips(false)}>
          <div className="tips-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="tips-modal-title">{t('tipsTitle')}</div>
            <div className="tip"><div className="tip-ico">💡</div>{t('tipLight')}</div>
            <div className="tip"><div className="tip-ico">🚫</div>{t('tipNoMakeup')}</div>
            <div className="tip"><div className="tip-ico">👁</div>{t('tipLook')}</div>
            <div className="tip"><div className="tip-ico">✂️</div>{t('tipHair')}</div>
            <button className="btn" type="button" onClick={() => setShowTips(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
