import { getShareLabels } from '../i18n/translations'

const PHOTO_HEIGHT = Math.round(1920 * 0.65)

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try {
        if (img.decode) await img.decode()
      } catch {
        // decode optional
      }
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
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

function drawCoverPhoto(ctx, img, width, height) {
  const scale = Math.max(width / img.width, height / img.height)
  const sw = width / scale
  const sh = height / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
}

function getProfileName(profile, data) {
  return (profile?.name?.trim() || data?.userName?.trim() || 'NOORA')
}

async function ensureFonts() {
  if (!document.fonts?.load) return
  await Promise.all([
    document.fonts.load('bold 48px "Bebas Neue"'),
    document.fonts.load('bold 52px "Bebas Neue"'),
    document.fonts.load('bold 240px "Bebas Neue"'),
    document.fonts.load('bold 52px "Outfit"'),
    document.fonts.load('36px "Outfit"'),
    document.fonts.load('38px "Outfit"'),
    document.fonts.load('bold 40px "Outfit"')
  ])
}

function drawBottomPanel(ctx) {
  const bgGrad = ctx.createLinearGradient(0, PHOTO_HEIGHT, 0, 1920)
  bgGrad.addColorStop(0, '#120820')
  bgGrad.addColorStop(0.5, '#0a0518')
  bgGrad.addColorStop(1, '#06030f')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, PHOTO_HEIGHT, 1080, 1920 - PHOTO_HEIGHT)
}

export async function generateShareCard(data, profile, userPhoto) {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#06030f'
  ctx.fillRect(0, 0, 1080, 1920)

  if (userPhoto) {
    const img = await loadImage(userPhoto)
    drawCoverPhoto(ctx, img, 1080, PHOTO_HEIGHT)

    const fadeGrad = ctx.createLinearGradient(0, PHOTO_HEIGHT - 480, 0, PHOTO_HEIGHT + 80)
    fadeGrad.addColorStop(0, 'rgba(6,3,15,0)')
    fadeGrad.addColorStop(0.55, 'rgba(6,3,15,0.85)')
    fadeGrad.addColorStop(1, 'rgba(6,3,15,1)')
    ctx.fillStyle = fadeGrad
    ctx.fillRect(0, PHOTO_HEIGHT - 480, 1080, 560)
  } else {
    const placeholderGrad = ctx.createLinearGradient(0, 0, 0, PHOTO_HEIGHT)
    placeholderGrad.addColorStop(0, '#1a0d2e')
    placeholderGrad.addColorStop(1, '#120820')
    ctx.fillStyle = placeholderGrad
    ctx.fillRect(0, 0, 1080, PHOTO_HEIGHT)
  }

  drawBottomPanel(ctx)

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

  const userName = getProfileName(profile, data)
  const userAge = profile?.age ?? data?.userAge ?? 25

  ctx.fillStyle = 'white'
  ctx.font = 'bold 52px "Outfit", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(userName, 60, 1310)

  const scoreGrad = ctx.createLinearGradient(60, 1340, 520, 1580)
  scoreGrad.addColorStop(0, '#9B59FF')
  scoreGrad.addColorStop(0.5, '#BF5AF2')
  scoreGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = scoreGrad
  ctx.font = 'bold 240px "Bebas Neue", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(String(data.skinScore ?? '—'), 60, 1560)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '36px "Outfit", sans-serif'
  ctx.fillText('SKIN SCORE', 60, 1610)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, 60, 1640, 960, 80, 40)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '38px "Outfit", sans-serif'
  ctx.textAlign = 'center'

  const skinAge = data.skinAge ?? '—'
  const ageDiff = userAge - skinAge
  const ageText = ageDiff > 0
    ? `Возраст кожи: ${skinAge} — на ${ageDiff} лет моложе! 🔥`
    : `Возраст кожи: ${skinAge} лет`
  ctx.fillText(ageText, 540, 1690)

  const ctaGrad = ctx.createLinearGradient(290, 0, 790, 0)
  ctaGrad.addColorStop(0, '#BF5AF2')
  ctaGrad.addColorStop(1, '#FF375F')
  ctx.fillStyle = ctaGrad
  ctx.font = 'bold 40px "Outfit", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Проверь свою кожу → noora.uz', 540, 1850)

  return canvas.toDataURL('image/jpeg', 0.92)
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
