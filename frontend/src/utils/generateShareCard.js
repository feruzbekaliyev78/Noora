import { getShareLabels } from '../i18n/translations'

export async function generateShareCard(data, profile, userPhoto) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920)
  bgGrad.addColorStop(0, '#1a0d2e')
  bgGrad.addColorStop(0.5, '#120820')
  bgGrad.addColorStop(1, '#06030f')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1080, 1920)

  if (userPhoto) {
    const img = new Image()
    img.src = userPhoto
    await new Promise(r => { img.onload = r })
    ctx.drawImage(img, 0, 0, 1080, 1248)

    const fadeGrad = ctx.createLinearGradient(0, 800, 0, 1248)
    fadeGrad.addColorStop(0, 'rgba(6,3,15,0)')
    fadeGrad.addColorStop(1, 'rgba(6,3,15,1)')
    ctx.fillStyle = fadeGrad
    ctx.fillRect(0, 800, 1080, 448)
  }

  const logoGrad = ctx.createLinearGradient(60, 60, 160, 140)
  logoGrad.addColorStop(0, '#BF5AF2')
  logoGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = logoGrad
  roundRect(ctx, 60, 60, 80, 80, 20)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px "Bebas Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('N', 100, 118)

  const textGrad = ctx.createLinearGradient(160, 0, 380, 0)
  textGrad.addColorStop(0, '#BF5AF2')
  textGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = textGrad
  ctx.font = 'bold 52px "Bebas Neue", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('OORA', 165, 118)

  const userName = profile?.name || data.userName || 'Малика'
  const userAge = profile?.age ?? data.userAge ?? 25

  ctx.fillStyle = 'white'
  ctx.font = 'bold 52px "Outfit", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(userName, 60, 1320)

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '36px "Outfit", sans-serif'
  ctx.fillText('· Ташкент', 60 + ctx.measureText(userName).width + 20, 1320)

  const scoreGrad = ctx.createLinearGradient(60, 1350, 400, 1550)
  scoreGrad.addColorStop(0, '#9B59FF')
  scoreGrad.addColorStop(0.5, '#BF5AF2')
  scoreGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = scoreGrad
  ctx.font = 'bold 240px "Bebas Neue", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(String(data.skinScore), 60, 1570)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '36px "Outfit", sans-serif'
  ctx.fillText('SKIN SCORE', 60, 1620)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, 60, 1650, 960, 80, 40)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '38px "Outfit", sans-serif'
  ctx.textAlign = 'center'

  const ageDiff = userAge - data.skinAge
  const ageText = ageDiff > 0
    ? `Возраст кожи: ${data.skinAge} — на ${ageDiff} лет моложе! 🔥`
    : `Возраст кожи: ${data.skinAge} лет`
  ctx.fillText(ageText, 540, 1700)

  const ctaGrad = ctx.createLinearGradient(0, 0, 500, 0)
  ctaGrad.addColorStop(0, '#BF5AF2')
  ctaGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = ctaGrad
  ctx.font = 'bold 40px "Outfit", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Проверь свою кожу → noora.uz', 540, 1860)

  return canvas.toDataURL('image/jpeg', 0.92)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function shareCardImage(imageDataUrl, skinScore, lang = 'ru') {
  const labels = getShareLabels(lang)
  const blob = await (await fetch(imageDataUrl)).blob()
  const file = new File([blob], 'noora-skin.jpg', { type: 'image/jpeg' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: labels.shareTitle,
      text: labels.shareText(skinScore),
      files: [file]
    })
    return true
  }

  const a = document.createElement('a')
  a.href = imageDataUrl
  a.download = 'noora-skin.jpg'
  a.click()
  return false
}
