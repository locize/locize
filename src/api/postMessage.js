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
  if (!api.source) {
    api.source = document.getElementById('i18next-editor-iframe')?.contentWindow
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

if (typeof window !== 'undefined') {
  window.addEventListener('message', e => {
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
