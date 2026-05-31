import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { captureFromVideo } from '../utils/image'
import { analyzeFrame } from '../utils/frameValidator'
import ScreenHeader from '../components/ScreenHeader'

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
  const { takeCameraStream, setCapturedImage, showToast } = useApp()
  const { t } = useI18n()

  const videoRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)
  const facingRef = useRef('user')

  const [ready, setReady] = useState(false)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [validation, setValidation] = useState({ lightOk: false, faceOk: false })

  const canSnap = ready && validation.lightOk && validation.faceOk && !capturing

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
    setValidation({ lightOk: false, faceOk: false })
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

  const handleGallery = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const image = reader.result
      setCapturedImage(image)
      stopCamera()
      navigate('/analyzing', { state: { capturedImage: image } })
    }
    reader.onerror = () => showToast(t('galleryError'))
    reader.readAsDataURL(file)
  }

  useEffect(() => {
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

    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video?.videoWidth) return
      setValidation(analyzeFrame(video))
    }, 500)

    return () => clearInterval(interval)
  }, [ready])

  const snap = () => {
    if (!canSnap || !videoRef.current) return

    const video = videoRef.current
    setCapturing(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const image = captureFromVideo(video)
    setCapturedImage(image)
    stopCamera()
    navigate('/analyzing', { state: { capturedImage: image } })
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
          <div className={`vfc tl ${validation.faceOk ? 'ready' : ''}`} />
          <div className={`vfc tr ${validation.faceOk ? 'ready' : ''}`} />
          <div className={`vfc bl ${validation.faceOk ? 'ready' : ''}`} />
          <div className={`vfc br ${validation.faceOk ? 'ready' : ''}`} />
          <div className="chips">
            <div className={`chip ${validation.lightOk ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />💡 {validation.lightOk ? t('lightGood') : t('lightBad')}
            </div>
            <div className={`chip ${validation.faceOk ? 'ok' : 'bad'}`}>
              <div className="chip-dot" />👁 {validation.faceOk ? t('faceGood') : t('faceBad')}
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
          <div className={`shutter ${canSnap ? '' : 'disabled'}`} onClick={snap}>📸</div>
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
