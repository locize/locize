import { getIframeUrl } from '../vars.js'
import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'
import { debounce } from '../utils.js'

const legacyEventMapping = {
  committed: 'commitKeys'
}
function getMappedLegacyEvent (msg) {
  if (legacyEventMapping[msg]) return legacyEventMapping[msg]
  return msg
}

export function addLocizeSavedHandler (handler) {
  api.locizeSavedHandler = handler
}

export function setEditorLng (lng) {
  api.sendCurrentTargetLanguage(lng)
}

let pendingMsgs = []
const allowedActionsBeforeInit = ['locizeIsEnabled', 'requestInitialize']
export function sendMessage (action, payload) {
  // Re-resolve the iframe's contentWindow on every call rather than
  // caching the first value seen. Re-attaching the popup to the DOM
  // (e.g. our hydration-recovery resurrection observer) causes the
  // browser to re-navigate the iframe to its `src` — the original
  // contentWindow becomes a discarded `Window` that silently swallows
  // postMessage. If the source changed under us, treat it as a fresh
  // editor session: drop `initialized` so the handshake runs again.
  const currentSource = document.getElementById('i18next-editor-iframe')?.contentWindow
  if (currentSource) {
    if (api.source && api.source !== currentSource) {
      api.initialized = false
    }
    api.source = currentSource
  }
  if (!api.origin) api.origin = getIframeUrl()

  if (
    !api.source ||
    !api.source.postMessage ||
    (!api.initialized && allowedActionsBeforeInit.indexOf(action) < 0)
  ) {
    // console.warn('out nok queuing - ', api.source, api.origin, action, payload);
    pendingMsgs.push({ action, payload })
    return
  }

  // console.warn('out ok - ', api.source, api.origin, action, payload)

  if (api.legacy) {
    api.source.postMessage(
      { message: action, ...payload }, // message for legacy
      api.origin
    )
  } else {
    api.source.postMessage(
      {
        sender: 'i18next-editor',
        senderAPIVersion: 'v2',
        action,
        message: action,
        payload
      },
      api.origin
    )
  }

  // handle pendings
  const todo = pendingMsgs
  pendingMsgs = [] // reset before recursive call
  todo.forEach(({ action, payload }) => {
    sendMessage(action, payload)
  })
}

const sendCurrentParsedContentDebounced = () => {
  sendMessage('sendCurrentParsedContent', {
    content: Object.values(store.data).map(item => {
      return {
        id: item.id,
        keys: item.keys
      }
    }),
    uninstrumented: Object.values(uninstrumentedStore.data).map(item => {
      return {
        id: item.id,
        keys: item.keys
      }
    })
  })
}

const handlers = {}
let repeat = 5
export const api = {
  init: (implementation, clickHandler) => {
    api.i18n = implementation
    api.clickHandler = clickHandler
  },

  requestInitialize: payload => {
    sendMessage('requestInitialize', payload)

    if (api.initInterval) return
    // Reset the retry budget at the start of each handshake cycle.
    // Without this, a second handshake (e.g. after the popup iframe
    // was re-navigated by host hydration recovery) would fire only
    // once before the leftover negative `repeat` aborted the loop.
    repeat = 5
    api.initInterval = setInterval(() => {
      repeat = repeat - 1
      api.requestInitialize(payload)

      if (repeat < 0 && api.initInterval) {
        clearInterval(api.initInterval)
        delete api.initInterval
      }
    }, 2000)
  },

  selectKey: meta => {
    sendMessage('selectKey', meta)
  },

  confirmResourceBundle: payload => {
    sendMessage('confirmResourceBundle', payload)
  },

  sendCurrentParsedContent: debounce(sendCurrentParsedContentDebounced, 500),

  sendCurrentTargetLanguage: lng => {
    sendMessage('sendCurrentTargetLanguage', {
      targetLng: lng || (api.i18n && api.i18n.getLng && api.i18n.getLng())
    })
  },

  sendHrefchanged: href => {
    sendMessage('hrefChanged', { href })
  },

  addHandler: (action, fc) => {
    if (!handlers[action]) handlers[action] = []
    handlers[action].push(fc)
  },

  sendLocizeIsEnabled: payload => {
    sendMessage('locizeIsEnabled', { ...payload, enabled: true })
  },

  onAddedKey: (lng, ns, key, value) => {
    const msg = {
      lng,
      ns,
      key,
      value
    }

    sendMessage('added', msg)
  }
}

// Compute the expected origin once at module load. The locize InContext
// editor iframe is the only legitimate source of messages handled here.
// Without this check, any page that can embed the host (or that the host
// embeds) can invoke editKey/commitKeys/etc. against it — browser-enforced
// e.origin is the right signal, not the attacker-controlled e.data.sender.
const getExpectedIframeOrigin = () => {
  try {
    return new URL(getIframeUrl()).origin
  } catch (err) {
    return null
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', e => {
    const expectedOrigin = getExpectedIframeOrigin()
    if (!expectedOrigin || e.origin !== expectedOrigin) return

    const { sender, /* senderAPIVersion, */ action, message, payload } = e.data
    // console.warn(sender, action, message, payload)

    if (message) {
      const usedEventName = getMappedLegacyEvent(message)
      if (handlers[usedEventName]) {
        handlers[usedEventName].forEach(fc => {
          fc(payload, e)
        })
      }
    } else if (sender === 'i18next-editor-frame' && handlers[action]) {
      // console.warn('ok in', action, payload);
      handlers[action].forEach(fc => {
        fc(payload, e)
      })
    }
  })
}
