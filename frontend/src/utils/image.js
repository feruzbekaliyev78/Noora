export function normalizeImage(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  let rSum = 0, gSum = 0, bSum = 0

  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
  }

  const pixels = data.length / 4
  const avgR = rSum / pixels
  const avgG = gSum / pixels
  const avgB = bSum / pixels
  const avg = (avgR + avgG + avgB) / 3
  const target = 128
  const brightness = target / (avg || 1)

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * brightness)
    data[i + 1] = Math.min(255, data[i + 1] * brightness)
    data[i + 2] = Math.min(255, data[i + 2] * brightness)
  }

  ctx.putImageData(imageData, 0, 0)
}

export function captureFromVideo(video, size = 800) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const vw = video.videoWidth
  const vh = video.videoHeight
  const min = Math.min(vw, vh)
  const sx = (vw - min) / 2
  const sy = (vh - min) / 2

  ctx.drawImage(video, sx, sy, min, min, 0, 0, size, size)
  normalizeImage(ctx, canvas)
  return canvas.toDataURL('image/jpeg', 0.85)
}
