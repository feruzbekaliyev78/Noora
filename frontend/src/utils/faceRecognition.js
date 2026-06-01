import * as faceapi from 'face-api.js'

let modelsLoaded = false
let modelsFailed = false

export const loadFaceModels = async () => {
  if (modelsLoaded) return true
  if (modelsFailed) return false

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    ])
    modelsLoaded = true
    return true
  } catch (err) {
    modelsFailed = true
    console.warn('Face-api models failed to load:', err)
    return false
  }
}

export const getFaceDescriptor = async (imageElement) => {
  try {
    const ready = await loadFaceModels()
    if (!ready || !imageElement) return null

    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) return null
    return Array.from(detection.descriptor)
  } catch (err) {
    console.warn('Face descriptor failed:', err)
    return null
  }
}

export const isSameFace = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) return false

  try {
    const d1 = new Float32Array(descriptor1)
    const d2 = new Float32Array(descriptor2)
    const distance = faceapi.euclideanDistance(d1, d2)
    return distance < 0.6
  } catch (err) {
    console.warn('Face comparison failed:', err)
    return false
  }
}
