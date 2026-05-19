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

    // Append the popup to <html> (sibling of <body>) rather than into
    // <body>, and watch for hydration-recovery removal.
    //
    // When a framework hydrates the whole document via
    // `hydrateRoot(document, ...)` (React Router v7 framework mode and
    // similar SSR setups) and the server / client render diverge —
    // which i18next-subliminal can cause on its own, by wrapping
    // client-side translation values with invisible Unicode markers
    // that are absent in the SSR pass — React's
    // `clearContainerSparingly` runs during commit and removes any DOM
    // children it doesn't own. It recurses through HTML / HEAD / BODY
    // but removes everything else at every level, so placing the
    // popup as a child of <html> is not enough on its own to escape
    // the sweep when recovery happens at the document level.
    //
    // We therefore also install a bounded MutationObserver that
    // re-attaches the same popup element if it's removed during the
    // first few seconds after init. Re-attaching the same element
    // (not a clone) preserves all listeners and message ports that
    // `initDragElement` / `initResizeElement` and the iframe URL
    // contents set up. The observer disconnects after a short window
    // so an intentional teardown later in the session is unaffected.
    if (!isInIframe && !document.getElementById(popupId)) {
      const popupEl = Popup(getIframeUrl(), () => {
        // The iframe `load` event fires on every navigation, including
        // the implicit re-navigation that the browser performs when our
        // resurrection observer re-attaches the popup after a hydration-
        // mismatch recovery. Each load is effectively a brand-new editor
        // session: the cached `api.source` reference points at a
        // discarded window, any in-flight retry interval is stale, and
        // the handshake needs to start over. Wipe that state before
        // calling requestInitialize so the new contentWindow is the one
        // that receives the message.
        api.source = document.getElementById('i18next-editor-iframe')?.contentWindow
        api.initialized = false
        if (api.initInterval) {
          clearInterval(api.initInterval)
          delete api.initInterval
        }
        api.requestInitialize(config)
      })
      document.documentElement.append(popupEl)
      initDragElement()
      initResizeElement()

      if (typeof MutationObserver === 'function') {
        const MAX_REATTACHMENTS = 5
        const WATCH_DURATION_MS = 10000
        let reattachments = 0
        // eslint-disable-next-line no-undef
        const watcher = new MutationObserver(() => {
          if (document.getElementById(popupId)) return
          if (reattachments >= MAX_REATTACHMENTS) {
            watcher.disconnect()
            return
          }
          reattachments++
          document.documentElement.append(popupEl)
        })
        watcher.observe(document.documentElement, { childList: true, subtree: true })
        setTimeout(() => watcher.disconnect(), WATCH_DURATION_MS)
      }
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

  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      continueToStart()
    })
  }
}
