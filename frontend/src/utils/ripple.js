export function createRipple(btn, e) {
  const r = document.createElement('span')
  r.className = 'ripple'
  const rect = btn.getBoundingClientRect()
  const sz = Math.max(rect.width, rect.height)
  r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px`
  btn.appendChild(r)
  setTimeout(() => r.remove(), 700)
}
