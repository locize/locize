// (Re)aligns a box to its reference element. Split out from HighlightBox so an
// existing box can be moved in place when its node moves (container scroll,
// reflow) - tearing the box down and re-creating it would flicker.
export function positionHighlightBox (box, ele) {
  const rect = ele.getBoundingClientRect()

  box.style.top = `${rect.top - 2 + window.scrollY}px`
  box.style.left = `${rect.left - 2 + window.scrollX}px`
  box.style.height = `${rect.height + 4}px`
  box.style.width = `${rect.width + 4}px`
}

export function HighlightBox (ele, borderColor, shadowColor) {
  const box = document.createElement('div')
  box.classList.add('i18next-editor-highlight')
  box.style = `position: absolute; z-index: 99999; pointer-events: none; border: ${borderColor === 'none' ? 'none' : `1px solid ${borderColor}`
    }; border-radius: 15px; ${shadowColor ? `box-shadow: inset 1px 1px 5px rgba(255, 255, 255, 0.1), inset -1px -1px 5px rgba(61, 67, 69, 0.3), 0 0 20px 0 ${shadowColor};` : ''
    }`
  positionHighlightBox(box, ele)
  box.setAttribute('data-i18next-editor-element', 'true')

  return box
}
