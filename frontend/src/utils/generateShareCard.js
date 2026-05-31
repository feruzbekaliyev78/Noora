export async function generateShareCard(data, profile, capturedImage) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 1080, 1920)
  grad.addColorStop(0, '#12062a')
  grad.addColorStop(0.35, '#200838')
  grad.addColorStop(0.65, '#160620')
  grad.addColorStop(1, '#080412')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1920)

  ctx.strokeStyle = 'rgba(191,90,242,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < 1080; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke()
  }
  for (let y = 0; y < 1920; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke()
  }

  ctx.textAlign = 'center'

  const logoGrad = ctx.createLinearGradient(400, 80, 680, 80)
  logoGrad.addColorStop(0, '#BF5AF2')
  logoGrad.addColorStop(1, '#FF375F')
  ctx.font = 'bold 60px "Bebas Neue", sans-serif'
  ctx.fillStyle = logoGrad
  ctx.fillText('NOORA', 540, 100)

  if (capturedImage) {
    const img = await loadImage(capturedImage)
    ctx.save()
    ctx.beginPath()
    ctx.arc(540, 320, 120, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, 420, 200, 240, 240)
    ctx.restore()
  }

  ctx.font = '36px "Outfit", sans-serif'
  ctx.fillStyle = 'rgba(245,238,255,0.6)'
  ctx.fillText(`${profile.name} · ${profile.city}`, 540, 480)

  const scoreGrad = ctx.createLinearGradient(300, 700, 780, 700)
  scoreGrad.addColorStop(0, '#9B59FF')
  scoreGrad.addColorStop(0.5, '#BF5AF2')
  scoreGrad.addColorStop(1, '#FF375F')
  ctx.font = '300px "Bebas Neue", sans-serif'
  ctx.fillStyle = scoreGrad
  ctx.fillText(String(data.skinScore), 540, 900)

  ctx.font = '48px "Outfit", sans-serif'
  ctx.fillStyle = '#F5EEFF'
  ctx.fillText(`Возраст кожи: ${data.skinAge} лет`, 540, 1100)

  const stats = [
    `${data.hydration}%`,
    `${data.tone}%`,
    data.pores,
    data.texture
  ]
  const labels = ['Увлажн', 'Тон', 'Поры', 'Текст']
  stats.forEach((val, i) => {
    const x = 135 + i * 270
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x - 100, 1200, 200, 120, 20)
    ctx.fill()
    ctx.font = 'bold 40px "Outfit", sans-serif'
    ctx.fillStyle = scoreGrad
    ctx.fillText(val, x, 1260)
    ctx.font = '28px "Outfit", sans-serif'
    ctx.fillStyle = 'rgba(245,238,255,0.45)'
    ctx.fillText(labels[i], x, 1300)
  })

  ctx.font = '40px "Outfit", sans-serif'
  ctx.fillStyle = 'rgba(245,238,255,0.45)'
  ctx.fillText('Проверь свою кожу → noora.uz', 540, 1800)

  return canvas.toDataURL('image/jpeg', 0.92)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
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

export async function shareCardImage(imageDataUrl, skinScore) {
  const blob = await (await fetch(imageDataUrl)).blob()
  const file = new File([blob], 'noora-skin.jpg', { type: 'image/jpeg' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'Мой результат NOORA',
      text: `Мой Skin Score: ${skinScore} 🔥 Проверь свою кожу!`,
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
