import { useRef, useEffect, useCallback, useState } from 'react'

const CAMERA_CONSTRAINTS = [
  { video: { facingMode: { ideal: 'user' } }, audio: false },
  { video: { facingMode: 'user' }, audio: false },
  { video: true, audio: false }
]

export function useCamera(initialStream = null) {
  const videoRef = useRef(null)
  const streamRef = useRef(initialStream)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  const attachStream = useCallback(async (stream) => {
    if (!stream || !videoRef.current) return false

    streamRef.current = stream
    const video = videoRef.current
    video.srcObject = stream
    video.setAttribute('playsinline', 'true')
    video.muted = true

    await video.play()
    setReady(true)
    setError(null)
    return true
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API unavailable')
      return
    }

    try {
      setError(null)
      const stream = await requestCameraStream()
      await attachStream(stream)
    } catch (err) {
      setReady(false)
      setError(err.message || 'Camera unavailable')
    }
  }, [attachStream])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setReady(false)
  }, [])

  useEffect(() => {
    if (initialStream) {
      attachStream(initialStream)
    }
  }, [initialStream, attachStream])

  useEffect(() => {
    if (streamRef.current && videoRef.current && !ready) {
      attachStream(streamRef.current)
    }
  }, [ready, attachStream])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { videoRef, start, stop, ready, error }
}

export async function requestCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API unavailable')
  }

  let lastError
  for (const constraints of CAMERA_CONSTRAINTS) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
