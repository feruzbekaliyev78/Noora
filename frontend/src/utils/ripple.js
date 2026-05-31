export function createRipple(btn, e) {
  const r = document.createElement('span')
  r.className = 'ripple'
  const rect = btn.getBoundingClientRect()
  const sz = Math.max(rect.width, rect.height)
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.width / 2
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.height / 2
  r.style.cssText = `width:${sz}px;height:${sz}px;left:${clientX - rect.left - sz / 2}px;top:${clientY - rect.top - sz / 2}px`
  btn.appendChild(r)
  setTimeout(() => r.remove(), 700)
}
