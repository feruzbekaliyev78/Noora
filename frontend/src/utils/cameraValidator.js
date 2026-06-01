import * as faceapi from 'face-api.js'

const EMPTY_RESULT = {
  lightOk: false,
  faceOk: false,
  noMakeup: false,
  foreheadOk: false,
  allGood: false
}

let detectorReady = false
let detectorFailed = false
let loadPromise = null

export const initFaceDetector = async () => {
  if (detectorReady) return true
  if (detectorFailed) return false
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      detectorReady = true
      return true
    } catch (err) {
      detectorFailed = true
      console.warn('Tiny face detector failed to load:', err)
      return false
    }
  })()

  return loadPromise
}

async function detectFace(canvas) {
  if (!detectorReady) return false

  try {
    const detection = await faceapi.detectSingleFace(
      canvas,
      new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
    )
    return !!detection
  } catch (err) {
    console.warn('Face detection failed:', err)
    return false
  }
}

export const validateFrame = async (video) => {
  if (!video?.videoWidth || !video?.videoHeight) {
    return { ...EMPTY_RESULT }
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, 100, 100)

    const pixels = ctx.getImageData(0, 0, 100, 100).data
    let brightness = 0
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
    }
    brightness = brightness / (pixels.length / 4)
    const lightOk = brightness > 85 && brightness < 220

    const lipPixels = ctx.getImageData(35, 65, 30, 15).data
    let redCount = 0
    for (let i = 0; i < lipPixels.length; i += 4) {
      const r = lipPixels[i]
      const g = lipPixels[i + 1]
      const b = lipPixels[i + 2]
      if (r > 150 && r > g * 1.4 && r > b * 1.4) redCount++
    }
    const noMakeup = (redCount / (lipPixels.length / 4)) < 0.3

    const foreheadPixels = ctx.getImageData(25, 5, 50, 20).data
    let foreheadBrightness = 0
    for (let i = 0; i < foreheadPixels.length; i += 4) {
      foreheadBrightness += (foreheadPixels[i] + foreheadPixels[i + 1] + foreheadPixels[i + 2]) / 3
    }
    foreheadBrightness = foreheadBrightness / (foreheadPixels.length / 4)
    const foreheadOk = foreheadBrightness > 50

    const faceOk = await detectFace(canvas)

    return {
      lightOk,
      noMakeup,
      faceOk,
      foreheadOk,
      allGood: lightOk && faceOk && noMakeup && foreheadOk
    }
  } catch (err) {
    console.warn('Frame validation failed:', err)
    return { ...EMPTY_RESULT }
  }
}
