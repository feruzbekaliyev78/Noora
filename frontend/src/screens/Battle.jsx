import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import TabBar from '../components/TabBar'
import ScreenHeader from '../components/ScreenHeader'
import { createRipple } from '../utils/ripple'

export default function Battle() {
  const { analysis, profile, showToast } = useApp()
  const { t } = useI18n()

  const friendScore = useMemo(
    () => (analysis ? Math.max(40, analysis.skinScore - 8 + Math.floor(Math.random() * 16)) : 75),
    [analysis]
  )
  const youWin = (analysis?.skinScore ?? 0) >= friendScore

  const handleShare = (e) => {
    createRipple(e.currentTarget, e)
    showToast(t('cardReady'))
  }

  return (
    <div className="screen-page screen-battle">
      <div className="b1 blob" style={{ opacity: 0.1 }} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="bt-scroll">
          <div className="safe-top" />
          <ScreenHeader title={t('battleTitle')} fallback="/result" />
          <div className="bt-title">{t('battleTitle')}</div>
          <div className="bt-sub">{t('battleSub')}</div>
          <div className="bt-avatars">
            <div className={`bt-avatar ${youWin ? 'winner' : ''}`}>
              {analysis ? '😊' : '👤'}
            </div>
            <div className="bt-vs">{t('vs')}</div>
            <div className={`bt-avatar ${!youWin ? 'winner' : ''}`}>👩</div>
          </div>
          {analysis && (
            <>
              <div className="bt-nom">
                {youWin
                  ? t('battleWinner', { name: profile.name, you: analysis.skinScore, friend: friendScore })
                  : t('battleScoreLine', { you: analysis.skinScore, friend: friendScore })}
              </div>
              <div className="bt-nom">
                💧 {t('battleHydrationBetter')}, {t('battleToneBetter')}
              </div>
            </>
          )}
          <button className="btn" onClick={handleShare}>{t('battleShare')}</button>
        </div>
      </div>
      <TabBar />
      <div className="safe-bot" />
    </div>
  )
}
