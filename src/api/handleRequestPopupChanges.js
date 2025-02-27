import { api } from './postMessage.js'
import { popupId } from '../ui/elements/popup.js'

function handler (payload) {
  const { containerStyle } = payload

  if (containerStyle) {
    const popup = document.getElementById(popupId)

    if (!popup) return

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
  }
}

api.addHandler('requestPopupChanges', handler)
