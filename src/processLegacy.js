import { api, sendMessage } from './api/index.js'
import { createClickHandler } from './clickHandler.js'

export function startLegacy (implementation = {}) {
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
  api.init(
    implementation,
    createClickHandler(payload => {
      sendMessage('clickedElement', { payload })
    }, implementation.getLocizeDetails())
  )

  // changes to api to reflect legacy
  api.sendCurrentTargetLanguage = lng => {
    sendMessage('setLng', { lng: lng || implementation.getLng() })
  }

  // propagate url changes
  if (typeof window !== 'undefined') {
    let oldHref = window.document.location.href
    window.addEventListener('load', () => {
      sendMessage('hrefChanged', { href: window.document.location.href })

      const bodyList = window.document.querySelector('body')

      const observer = new window.MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (oldHref !== window.document.location.href) {
            // console.warn('url changed', oldHref, document.location.href);
            oldHref = window.document.location.href

            sendMessage('hrefChanged', { href: oldHref })
          }
        })
      })

      const config = {
        childList: true,
        subtree: true
      }

      observer.observe(bodyList, config)
    })
  }

  // start stuff
  implementation?.bindLanguageChange(lng => {
    api.sendCurrentTargetLanguage(implementation.getLng())
  })
  implementation?.bindMissingKeyHandler((lng, ns, k, val) => {
    api.onAddedKey(lng, ns, k, val)
  })
}
