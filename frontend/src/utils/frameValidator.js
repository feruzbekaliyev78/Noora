function isSkinTone(r, g, b) {
  return r > 60 && g > 40 && b > 20 && r > g && r > b && r - g > 12 && r - b > 12
}

export function analyzeFrame(video) {
  if (!video?.videoWidth) {
    return { lightOk: false, faceOk: false }
  }

  const canvas = document.createElement('canvas')
  const width = 160
  const height = 120
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0, width, height)

  const { data } = ctx.getImageData(0, 0, width, height)
  let totalBrightness = 0
  let centerSkin = 0
  const cx0 = width * 0.2
  const cx1 = width * 0.8
  const cy0 = height * 0.1
  const cy1 = height * 0.9
  const centerArea = (cx1 - cx0) * (cy1 - cy0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b

      if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1 && isSkinTone(r, g, b)) {
        centerSkin++
      }
    }
  }

  const pixels = width * height
  const avgBrightness = totalBrightness / pixels
  const faceRatio = centerSkin / centerArea

  return {
    lightOk: avgBrightness >= 70,
    faceOk: faceRatio >= 0.1
  }
}
