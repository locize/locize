export function HighlightBox(ele, borderColor, shadowColor) {
  const rect = ele.getBoundingClientRect()

  const box = document.createElement('div')
  box.classList.add('i18next-editor-highlight')
  box.style = `position: absolute; z-index: 99999; pointer-events: none; top: ${rect.top - 2 + window.scrollY
    }px; left: ${rect.left - 2 + window.scrollX}px; height: ${rect.height + 4
    }px; width: ${rect.width + 4
    }px; border: ${borderColor === 'none' ? 'none' : `1px solid ${borderColor}`}; border-radius: 15px; ${shadowColor ? `box-shadow: inset 1px 1px 5px rgba(255, 255, 255, 0.1), inset -1px -1px 5px rgba(61, 67, 69, 0.3), 0 0 20px 0 ${shadowColor};` : ''
    }`
  box.setAttribute('data-i18next-editor-element', 'true')

  return box
}
