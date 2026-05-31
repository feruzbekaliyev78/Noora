import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { captureFromVideo } from '../utils/image'

async function getCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API unavailable')
  }

  const attempts = [
    { video: { facingMode: { ideal: 'user' } }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
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
    const onReady = () => {
      video.removeEventListener('loadedmetadata', onReady)
      video.play().then(resolve).catch(reject)
    }
    video.addEventListener('loadedmetadata', onReady, { once: true })
  })
}

export default function Camera() {
  const navigate = useNavigate()
  const { takeCameraStream, setCapturedImage, showToast } = useApp()
  const { t } = useI18n()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [faceReady, setFaceReady] = useState(false)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)

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
    if (video) {
      video.srcObject = null
    }

    setReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await getCameraStream()
      await attachStream(stream)
    } catch (err) {
      console.error('getUserMedia failed:', err)
      showToast(t('cameraError'))
    }
  }, [attachStream, showToast, t])

  const bindVideoRef = useCallback((node) => {
    videoRef.current = node
    if (node && streamRef.current) {
      attachStream(streamRef.current)
    }
  }, [attachStream])

  useEffect(() => {
    const pendingStream = takeCameraStream()
    if (pendingStream) {
      streamRef.current = pendingStream
      if (videoRef.current) {
        attachStream(pendingStream)
      }
    } else {
      startCamera()
    }

    const timer = setTimeout(() => setFaceReady(true), 1500)

    return () => {
      clearTimeout(timer)
      stopCamera()
    }
  }, [takeCameraStream, attachStream, startCamera, stopCamera])

  const snap = () => {
    if (capturing || !videoRef.current) return

    const video = videoRef.current
    if (!ready || !video.videoWidth) {
      showToast(t('cameraError'))
      return
    }

    setCapturing(true)
    setFaceReady(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const image = captureFromVideo(video)
    setCapturedImage(image)
    stopCamera()

    navigate('/analyzing', { state: { capturedImage: image } })
  }

  return (
    <div className="screen-page">
      <div className="b3 blob" />
      <div className="safe-top" />
      <div className="cam-wrap">
        <div className="topbar">
          <div className="icon-btn" onClick={() => { stopCamera(); navigate('/onboarding') }}>←</div>
          <div className="topbar-title">{t('scanning')}</div>
          <div className="icon-btn">ℹ</div>
        </div>
        <div className="vf">
          <video
            ref={bindVideoRef}
            className="cam-video"
            playsInline
            muted
            autoPlay
          />
          {!ready && (
            <div className="cam-loading-overlay" aria-hidden="true">
              <div className="cam-video-placeholder">👤</div>
              <div className={`oval ${faceReady ? 'ready' : ''}`}>
                👤
                <div className="beam" />
              </div>
            </div>
          )}
          <div className={`vfc tl ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc tr ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc bl ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc br ${faceReady ? 'ready' : ''}`} />
          <div className="chips">
            <div className="chip ok"><div className="chip-dot" />{t('lightOk')}</div>
            <div className="chip warn"><div className="chip-dot" />{t('closer')}</div>
          </div>
        </div>
        <div className="tips">
          <div className="tip"><div className="tip-ico">💡</div>{t('tipLight')}</div>
          <div className="tip"><div className="tip-ico">🚫</div>{t('tipNoMakeup')}</div>
          <div className="tip"><div className="tip-ico">👁</div>{t('tipLook')}</div>
          <div className="tip"><div className="tip-ico">✂️</div>{t('tipHair')}</div>
        </div>
        <div className="shutter-row">
          <div className="shutter-side">🖼</div>
          <div className="shutter" onClick={snap}>📸</div>
          <div className="shutter-side" onClick={startCamera}>🔄</div>
        </div>
      </div>
      <div className="safe-bot" />
      <div className={`flash ${flash ? 'go' : ''}`} />
    </div>
  )
}
