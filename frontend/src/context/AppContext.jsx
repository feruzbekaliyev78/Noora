import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

function getUserId() {
  let id = localStorage.getItem('noora-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('noora-user-id', id)
  }
  return id
}

export function AppProvider({ children }) {
  const [capturedImage, setCapturedImage] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [userId] = useState(getUserId)
  const [profile] = useState({ name: 'Малика', city: 'Ташкент' })
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const addToHistory = useCallback((data) => {
    setHistory(prev => [{ ...data, createdAt: new Date() }, ...prev].slice(0, 10))
  }, [])

  return (
    <AppContext.Provider value={{
      capturedImage, setCapturedImage,
      analysis, setAnalysis,
      history, addToHistory,
      userId, profile,
      toast, showToast
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
