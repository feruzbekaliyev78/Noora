import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { captureFromVideo } from '../utils/image'

export default function Camera() {
  const navigate = useNavigate()
  const { takeCameraStream, setCapturedImage, showToast } = useApp()
  const initialStream = useMemo(() => takeCameraStream(), [takeCameraStream])
  const { videoRef, start, stop, ready, error } = useCamera(initialStream)
  const { t } = useI18n()
  const [faceReady, setFaceReady] = useState(false)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (!initialStream) {
      start()
    }
    const timer = setTimeout(() => setFaceReady(true), 1500)
    return () => {
      clearTimeout(timer)
      stop()
    }
  }, [initialStream, start, stop])

  useEffect(() => {
    if (error) showToast(t('cameraError'))
  }, [error, showToast, t])

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
    stop()

    navigate('/analyzing', { state: { capturedImage: image } })
  }

  return (
    <div className="screen-page">
      <div className="b3 blob" />
      <div className="safe-top" />
      <div className="cam-wrap">
        <div className="topbar">
          <div className="icon-btn" onClick={() => { stop(); navigate('/onboarding') }}>←</div>
          <div className="topbar-title">{t('scanning')}</div>
          <div className="icon-btn">ℹ</div>
        </div>
        <div className="vf">
          <video
            ref={videoRef}
            className={`cam-video ${ready ? 'visible' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />
          {!ready && (
            <>
              <div className="cam-video-placeholder">👤</div>
              <div className={`oval ${faceReady ? 'ready' : ''}`}>
                👤
                <div className="beam" />
              </div>
            </>
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
          <div className="shutter-side" onClick={start}>🔄</div>
        </div>
      </div>
      <div className="safe-bot" />
      <div className={`flash ${flash ? 'go' : ''}`} />
    </div>
  )
}
