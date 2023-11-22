const sheet = (function () {
  if (typeof document === 'undefined') return
  const style = document.createElement('style')
  document.head.appendChild(style)
  return style.sheet
})()

export { sheet }
