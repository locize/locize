export function HighlightBox (ele, borderColor, shadowColor) {
  const rect = ele.getBoundingClientRect()

  const box = document.createElement('div')
  box.style = `position: absolute; top: ${
    rect.top - 2 + window.scrollY
  }px; left: ${rect.left - 2 + window.scrollX}px; height: ${
    rect.height + 4
  }px; width: ${
    rect.width + 4
  }px; border: 1px solid ${borderColor}; border-radius: 2px; ${
    shadowColor ? `box-shadow: 0 0 40px 0 ${shadowColor};` : ''
  }`
  box.setAttribute('data-i18next-editor-element', 'true')

  return box
}
