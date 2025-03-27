import { parseTree, setImplementation } from './parser.js'
import { createObserver } from './observer.js'
import { startMouseTracking } from './ui/mouseDistance.js'
import { initDragElement, initResizeElement } from './ui/popup.js'
import { Popup, popupId } from './ui/elements/popup.js'
import { getIframeUrl } from './vars.js'
import { api } from './api/index.js'
import { isInIframe, getQsParameterByName } from './utils.js'
import * as implementations from './implementations/index.js'

const dummyImplementation = implementations.dummy.getImplementation()

// eslint-disable-next-line no-unused-vars
let data = []

export function start (
  implementation = dummyImplementation,
  opt = { show: false, qsProp: 'incontext' }
) {
  if (typeof document === 'undefined') return

  const showInContext =
    opt.show || getQsParameterByName(opt.qsProp || 'incontext') === 'true'

  // get locize id, version
  const scriptEle = document.getElementById('locize')

  let config = {}
  ;['projectId', 'version'].forEach(attr => {
    if (!scriptEle) return
    let value =
      scriptEle.getAttribute(attr.toLowerCase()) ||
      scriptEle.getAttribute('data-' + attr.toLowerCase())
    if (value === 'true') value = true
    if (value === 'false') value = false
    if (value !== undefined && value !== null) config[attr] = value
  })
  config = { ...implementation.getLocizeDetails(), ...config, ...opt }

  // init stuff
  api.config = config
  api.init(implementation)
  setImplementation(implementation)

  // start stuff
  implementation?.bindLanguageChange(lng => {
    api.sendCurrentTargetLanguage(implementation.getLng())
  })

  function continueToStart () {
    // don't show if not in iframe and no qs
    if (!isInIframe && !showInContext) return

    const observer = createObserver(document.body, eles => {
      eles.forEach(ele => {
        data = parseTree(ele)
      })
      api.sendCurrentParsedContent()
    })
    observer.start()

    startMouseTracking(observer)

    // append popup
    if (!isInIframe && !document.getElementById(popupId)) {
      document.body.append(
        Popup(getIframeUrl(), () => {
          api.requestInitialize(config)
        })
      )
      initDragElement()
      initResizeElement()
    }

    // propagate url changes
    if (typeof window !== 'undefined') {
      let oldHref = window.document.location.href
      api.sendHrefchanged(oldHref)

      const bodyList = window.document.querySelector('body')

      const observer = new window.MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (oldHref !== window.document.location.href) {
            // console.warn('url changed', oldHref, document.location.href);
            oldHref = window.document.location.href

            api.sendHrefchanged(oldHref)
          }
        })
      })

      const config = {
        childList: true,
        subtree: true
      }

      observer.observe(bodyList, config)
    }
  }

  if (document.body) return continueToStart()

  if (typeof window !== 'undefined') window.addEventListener('load', () => continueToStart())
}
