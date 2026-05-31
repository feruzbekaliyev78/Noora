import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { captureFromVideo } from '../utils/image'

export default function Camera() {
  const navigate = useNavigate()
  const { videoRef, start, stop, ready, error } = useCamera()
  const { setCapturedImage, showToast } = useApp()
  const { t } = useI18n()
  const [faceReady, setFaceReady] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    start()
    const timer = setTimeout(() => setFaceReady(true), 1500)
    return () => {
      clearTimeout(timer)
      stop()
    }
  }, [start, stop])

  useEffect(() => {
    if (error) showToast(t('cameraError'))
  }, [error, showToast, t])

  const snap = () => {
    if (!videoRef.current || !ready) return

    setFaceReady(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const image = captureFromVideo(videoRef.current)
    setCapturedImage(image)

    setTimeout(() => {
      stop()
      navigate('/analyzing')
    }, 300)
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
          {ready ? (
            <video ref={videoRef} className="cam-video" playsInline muted autoPlay />
          ) : (
            <div className="cam-video-placeholder">👤</div>
          )}
          <div className={`vfc tl ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc tr ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc bl ${faceReady ? 'ready' : ''}`} />
          <div className={`vfc br ${faceReady ? 'ready' : ''}`} />
          {!ready && (
            <div className={`oval ${faceReady ? 'ready' : ''}`}>
              👤
              <div className="beam" />
            </div>
          )}
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
