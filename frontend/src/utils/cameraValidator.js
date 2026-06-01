import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

let faceLandmarker = null
let initPromise = null

const DEFAULT_RESULT = {
  light: false,
  lightBright: false,
  faceFound: false,
  lookingAt: false,
  forehead: false,
  noMakeup: false,
  allGood: false
}

export const initValidator = async () => {
  if (faceLandmarker) return true
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      )
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true
      })
      return true
    } catch (err) {
      console.warn('MediaPipe validator init failed:', err)
      return false
    }
  })()

  return initPromise
}

export const validateFrame = (videoElement) => {
  if (!videoElement?.videoWidth || !videoElement?.videoHeight) {
    return { ...DEFAULT_RESULT }
  }

  try {
    const result = { ...DEFAULT_RESULT }

    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement, 0, 0, 100, 100)
    const pixels = ctx.getImageData(0, 0, 100, 100).data
    let brightness = 0
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
    }
    brightness = brightness / (pixels.length / 4)
    result.lightBright = brightness >= 220
    result.light = brightness > 85 && brightness < 220

    const lipCanvas = document.createElement('canvas')
    lipCanvas.width = 50
    lipCanvas.height = 20
    const lipCtx = lipCanvas.getContext('2d')
    lipCtx.drawImage(
      videoElement,
      videoElement.videoWidth * 0.35,
      videoElement.videoHeight * 0.65,
      videoElement.videoWidth * 0.3,
      videoElement.videoHeight * 0.1,
      0,
      0,
      50,
      20
    )
    const lipPixels = lipCtx.getImageData(0, 0, 50, 20).data
    let redCount = 0
    for (let i = 0; i < lipPixels.length; i += 4) {
      const r = lipPixels[i]
      const g = lipPixels[i + 1]
      const b = lipPixels[i + 2]
      const saturation = Math.max(r, g, b) - Math.min(r, g, b)
      if (r > 150 && r > g * 1.4 && r > b * 1.4 && saturation > 50) redCount++
    }
    const lipRatio = redCount / (lipPixels.length / 4)
    result.noMakeup = lipRatio < 0.25

    if (faceLandmarker) {
      const detections = faceLandmarker.detectForVideo(videoElement, performance.now())

      if (detections.faceLandmarks?.length > 0) {
        result.faceFound = true
        const landmarks = detections.faceLandmarks[0]

        const noseTip = landmarks[1]
        result.lookingAt = Math.abs(noseTip.x - 0.5) < 0.15

        const foreheadTop = landmarks[10]
        const eyeCenter = landmarks[168]
        const foreheadSpace = eyeCenter.y - foreheadTop.y
        result.forehead = foreheadSpace > 0.08
      }
    }

    result.allGood = result.light && result.faceFound &&
      result.lookingAt && result.forehead && result.noMakeup

    return result
  } catch (err) {
    console.warn('Frame validation failed:', err)
    return { ...DEFAULT_RESULT }
  }
}
