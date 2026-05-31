import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { generateShareCard, shareCardImage } from '../utils/generateShareCard'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'

export default function ShareCard() {
  const navigate = useNavigate()
  const { analysis, capturedImage, profile, showToast } = useApp()
  const { t, lang } = useI18n()
  const [cardUrl, setCardUrl] = useState(null)
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    if (!analysis) {
      navigate('/result')
      return
    }

    let cancelled = false
    setGenerating(true)

    generateShareCard(analysis, profile, capturedImage)
      .then((url) => {
        if (!cancelled) setCardUrl(url)
      })
      .catch((err) => {
        console.error(err)
        showToast(t('analyzeError'))
      })
      .finally(() => {
        if (!cancelled) setGenerating(false)
      })

    return () => { cancelled = true }
  }, [analysis, capturedImage, profile, navigate, showToast, t])

  if (!analysis) return null

  const handleShare = async (e) => {
    createRipple(e.currentTarget, e)
    try {
      const url = cardUrl || await generateShareCard(analysis, profile, capturedImage)
      if (!cardUrl) setCardUrl(url)
      await shareCardImage(url, analysis.skinScore, lang)
      showToast(t('cardReady'))
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err)
        showToast(t('analyzeError'))
      }
    }
  }

  const handleDownload = async () => {
    try {
      const url = cardUrl || await generateShareCard(analysis, profile, capturedImage)
      if (!cardUrl) setCardUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = 'noora-skin.jpg'
      a.click()
      showToast(t('saved'))
    } catch (err) {
      console.error(err)
      showToast(t('analyzeError'))
    }
  }

  return (
    <div className="screen-page screen-share">
      <div className="safe-top" />
      <ScreenHeader title={t('shareCard')} fallback="/result" />
      <div className="share-preview-wrap">
        {generating && !cardUrl && (
          <div className="share-preview-loading">{t('shareCard')}...</div>
        )}
        {cardUrl && (
          <img src={cardUrl} alt="" className="share-preview-img" />
        )}
      </div>
      <div className="sc-actions">
        <button className="btn" type="button" onClick={handleShare} disabled={generating && !cardUrl}>
          {t('share')}
        </button>
        <div className="dl-btn" onClick={handleDownload} role="button" tabIndex={0}>⬇</div>
      </div>
      <div className="safe-bot" />
    </div>
  )
}
