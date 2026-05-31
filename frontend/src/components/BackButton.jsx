import { useNavigate } from 'react-router-dom'

export default function BackButton({ fallback = '/onboarding', onClick }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <div className="icon-btn" onClick={handleBack} role="button" aria-label="Back">←</div>
  )
}
