const API_URL = import.meta.env.VITE_API_URL || ''

export async function analyzeSkin(image) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || err.error || 'Analysis failed')
  }

  return res.json()
}
