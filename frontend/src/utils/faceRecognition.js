import * as faceapi from 'face-api.js'

let modelsLoaded = false

export const loadFaceModels = async () => {
  if (modelsLoaded) return

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  ])
  modelsLoaded = true
}

export const getFaceDescriptor = async (imageElement) => {
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) return null
  return Array.from(detection.descriptor)
}

export const isSameFace = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) return false

  const d1 = new Float32Array(descriptor1)
  const d2 = new Float32Array(descriptor2)
  const distance = faceapi.euclideanDistance(d1, d2)

  return distance < 0.6
}
