import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)

function getUserId() {
  let id = localStorage.getItem('noora-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('noora-user-id', id)
  }
  return id
}

function loadProfile() {
  try {
    const raw = localStorage.getItem('noora-profile')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        name: parsed.name || '',
        age: parsed.age ? Number(parsed.age) : null
      }
    }
  } catch {
    // ignore
  }
  return { name: '', age: null }
}

export function isProfileComplete(profile) {
  return Boolean(profile?.name?.trim() && profile?.age > 0)
}

export function AppProvider({ children }) {
  const [capturedImage, setCapturedImage] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [userId] = useState(getUserId)
  const [profile, setProfileState] = useState(loadProfile)
  const [toast, setToast] = useState(null)
  const cameraStreamRef = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const setProfile = useCallback((next) => {
    setProfileState(prev => {
      const updated = typeof next === 'function' ? next(prev) : next
      localStorage.setItem('noora-profile', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addToHistory = useCallback((data) => {
    setHistory(prev => [{ ...data, createdAt: new Date() }, ...prev].slice(0, 10))
  }, [])

  const setCameraStream = useCallback((stream) => {
    cameraStreamRef.current = stream
  }, [])

  const takeCameraStream = useCallback(() => {
    const stream = cameraStreamRef.current
    cameraStreamRef.current = null
    return stream
  }, [])

  return (
    <AppContext.Provider value={{
      capturedImage, setCapturedImage,
      analysis, setAnalysis,
      history, addToHistory,
      userId, profile, setProfile,
      toast, showToast,
      setCameraStream, takeCameraStream
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
