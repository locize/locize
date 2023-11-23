import { parseTree, setImplementation } from './parser.js'
import { createObserver } from './observer.js'
import { startMouseTracking } from './ui/mouseDistance.js'
import { initDragElement, initResizeElement } from './ui/popup.js'
import { Popup, popupId } from './ui/elements/popup.js'
import { getIframeUrl } from './vars.js'
import { api } from './api/index.js'

// eslint-disable-next-line no-unused-vars
let data = []

export function start (implementation = {}) {
  if (typeof document === 'undefined') return
  // get locize id, version
  const scriptEle = document.getElementById('locize')

  let config = {};
  ['projectId', 'version'].forEach(attr => {
    if (!scriptEle) return
    let value =
      scriptEle.getAttribute(attr.toLowerCase()) ||
      scriptEle.getAttribute('data-' + attr.toLowerCase())
    if (value === 'true') value = true
    if (value === 'false') value = false
    if (value !== undefined && value !== null) config[attr] = value
  })
  config = { ...implementation.getLocizeDetails(), ...config }

  // init stuff
  api.init(implementation)
  setImplementation(implementation)

  // start stuff
  implementation?.bindLanguageChange(lng => {
    api.sendCurrentTargetLanguage(implementation.getLng())
  })

  function continueToStart () {
    const observer = createObserver(document.body, eles => {
      eles.forEach(ele => {
        data = parseTree(ele)
      })
      api.sendCurrentParsedContent()
    })
    observer.start()

    startMouseTracking(observer)

    // append popup
    if (!document.getElementById(popupId)) {
      document.body.append(
        Popup(getIframeUrl(), () => {
          api.requestInitialize(config)
        })
      )
      initDragElement()
      initResizeElement()
    }
  }

  if (document.body) return continueToStart()

  window.addEventListener('load', () => continueToStart())
}
