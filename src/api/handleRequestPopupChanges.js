import { api } from './postMessage.js'
import { popupId } from '../ui/elements/popup.js'

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
      storedPos.top <
        window.innerHeight - containerStyle.height.replace('px', '')
    ) { popup.style.setProperty('top', storedPos.top + 'px') }
    if (
      storedPos &&
      storedPos.left &&
      storedPos.left <
        window.innerWidth - containerStyle.width.replace('px', '')
    ) { popup.style.setProperty('left', storedPos.left + 'px') }
  }
}

api.addHandler('requestPopupChanges', handler)
