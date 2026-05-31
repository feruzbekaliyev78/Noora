import BackButton from './BackButton'

export default function ScreenHeader({ title, fallback, onBack, right }) {
  return (
    <div className="topbar screen-header">
      <BackButton fallback={fallback} onClick={onBack} />
      {title ? <div className="topbar-title">{title}</div> : <div />}
      {right || <div className="icon-btn placeholder" aria-hidden="true" />}
    </div>
  )
}
