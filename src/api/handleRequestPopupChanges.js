import { api } from './postMessage.js'
import { popupId } from '../ui/elements/popup.js'

// CSS length values accepted for the popup's width/height. Must be a number
// followed by an allowed unit. Rejects anything carrying a semicolon, URL,
// calc() chain, or arbitrary property injection that could escape the
// height/width context into the popup's style sheet (CSS-exfil attacks,
// `behavior:url()` in legacy IE, etc.).
const CSS_LENGTH_RE = /^\d+(?:\.\d+)?(?:px|%|em|rem|vh|vw|ch|ex)$/i

function isSafeCssLength (v) {
  return typeof v === 'string' && CSS_LENGTH_RE.test(v)
}

function handler (payload) {
  const { containerStyle } = payload

  if (containerStyle) {
    const popup = document.getElementById(popupId)

    if (!popup) return

    let storedPos = window.localStorage.getItem('locize_popup_pos')
    if (storedPos) storedPos = JSON.parse(storedPos)
    let storedSize = window.localStorage.getItem('locize_popup_size')
    if (storedSize) storedSize = JSON.parse(storedSize)

    if (storedSize && storedSize.height && storedSize.width) {
      containerStyle.height = storedSize.height + 'px'
      containerStyle.width = storedSize.width + 'px'
    }

    // Validate attacker-controlled length strings before they are embedded
    // into calc() / setProperty arguments. Reject silently on malformed
    // input — the popup just keeps its previous size.
    if (containerStyle.height && !isSafeCssLength(containerStyle.height)) {
      delete containerStyle.height
    }
    if (containerStyle.width && !isSafeCssLength(containerStyle.width)) {
      delete containerStyle.width
    }

    if (containerStyle.height) {
      const diff = `calc(${containerStyle.height} - ${popup.style.height})`

      popup.style.setProperty('top', `calc(${popup.style.top} - ${diff})`)
      popup.style.setProperty('height', containerStyle.height)
    }

    if (containerStyle.width) {
      const diff = `calc(${containerStyle.width} - ${popup.style.width})`

      popup.style.setProperty('left', `calc(${popup.style.left} - ${diff})`)
      popup.style.setProperty('width', containerStyle.width)
    }

    if (
      storedPos &&
      storedPos.top &&
      containerStyle.height &&
      storedPos.top <
        window.innerHeight - containerStyle.height.replace('px', '')
    ) { popup.style.setProperty('top', storedPos.top + 'px') }
    if (
      storedPos &&
      storedPos.left &&
      containerStyle.width &&
      storedPos.left <
        window.innerWidth - containerStyle.width.replace('px', '')
    ) { popup.style.setProperty('left', storedPos.left + 'px') }
  }
}

api.addHandler('requestPopupChanges', handler)
