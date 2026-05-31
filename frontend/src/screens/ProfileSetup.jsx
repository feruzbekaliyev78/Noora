import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import LangToggle from '../components/LangToggle'
import { createRipple } from '../utils/ripple'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { profile, setProfile, showToast } = useApp()
  const { t } = useI18n()
  const [name, setName] = useState(profile.name || '')
  const [age, setAge] = useState(profile.age ? String(profile.age) : '')

  const handleContinue = (e) => {
    createRipple(e.currentTarget, e)

    const trimmedName = name.trim()
    const ageNum = parseInt(age, 10)

    if (!trimmedName) {
      showToast(t('profileNameRequired'))
      return
    }
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      showToast(t('profileAgeRequired'))
      return
    }

    setProfile({ name: trimmedName, age: ageNum })
    navigate('/onboarding')
  }

  return (
    <div className="screen-page screen-profile">
      <LangToggle />
      <div className="b1 blob" />
      <div className="b2 blob" />
      <div className="safe-top" />
      <div className="profile-content">
        <div className="ob-logo">
          <div className="ob-icon">N</div>
          <div className="ob-name">OORA</div>
        </div>
        <div className="profile-title">{t('profileTitle')}</div>
        <div className="profile-sub">{t('profileSubtitle')}</div>
        <label className="profile-field">
          <span className="profile-label">{t('nameLabel')}</span>
          <input
            className="profile-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('nameLabel')}
            autoComplete="name"
          />
        </label>
        <label className="profile-field">
          <span className="profile-label">{t('ageLabel')}</span>
          <input
            className="profile-input"
            type="number"
            inputMode="numeric"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
          />
        </label>
        <button className="btn" type="button" onClick={handleContinue}>{t('continueBtn')}</button>
      </div>
      <div className="safe-bot" />
    </div>
  )
}
