import { useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

const tabs = [
  { path: '/result', icon: '🏠', key: 'tabHome' },
  { path: '/camera', icon: '📸', key: 'tabScan' },
  { path: '/tracking', icon: '📊', key: 'tabTracking' },
  { path: '/battle', icon: '⚔️', key: 'tabBattle' }
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  return (
    <div className="tabbar show">
      {tabs.map(tab => (
        <div
          key={tab.path}
          className={`tab ${location.pathname === tab.path ? 'on' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <div className="tab-ico">{tab.icon}</div>
          <div className="tab-lbl">{t(tab.key)}</div>
          <div className="tab-bar-dot" />
        </div>
      ))}
    </div>
  )
}
