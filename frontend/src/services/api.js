const PRODUCTION_API_URL = 'https://noora-production.up.railway.app'

function getApiUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  if (import.meta.env.PROD) return PRODUCTION_API_URL

  return ''
}

const API_URL = getApiUrl()

export async function analyzeSkin(image) {
  if (!image) {
    throw new Error('Image is required')
  }

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json()
    : null

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || 'Analysis failed')
    error.code = data?.error
    throw error
  }

  if (!data) {
    throw new Error('Invalid API response')
  }

  return data
}
