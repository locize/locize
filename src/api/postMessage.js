import { getIframeUrl } from '../vars.js'
import { store } from '../store.js'

export function addLocizeSavedHandler (handler) {
  api.locizeSavedHandler = handler
}

export function turnOn () {
  api.scriptTurnedOff = false // unlock

  api.turnOn()
  return api.scriptTurnedOff
}

export function turnOff () {
  api.turnOff()

  api.scriptTurnedOff = true // lock
  return api.scriptTurnedOff
}

export function setEditorLng (lng) {
  api.sendCurrentTargetLanguage(lng)
}

let pendingMsgs = []
export function sendMessage (action, payload) {
  if (!api.source) {
    api.source = document.getElementById('i18next-editor-iframe')?.contentWindow
  }
  if (!api.origin) api.origin = getIframeUrl()

  if (!api.source || !api.source.postMessage) {
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
        senderAPIVersion: 'v1',
        action,
        message: action,
        payload
      }, // message for legacy
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

const handlers = {}
let repeat = 5
export const api = {
  init: (implementation, clickHandler) => {
    api.i18n = implementation
    api.clickHandler = clickHandler
  },

  requestInitialize: payload => {
    sendMessage('requestInitialize', payload)

    api.initInterval = setInterval(() => {
      repeat = repeat - 1
      api.requestInitialize(payload)

      if (repeat < 0 && api.initInterval) clearInterval(api.initInterval)
    }, 1000)
  },

  selectKey: meta => {
    sendMessage('selectKey', meta)
  },

  confirmResourceBundle: payload => {
    sendMessage('confirmResourceBundle', payload)
  },

  sendCurrentParsedContent: () => {
    sendMessage('sendCurrentParsedContent', {
      content: Object.values(store.data).map(item => {
        return {
          id: item.id,
          // subliminal: item.subliminal,
          keys: item.keys
        }
      })
    })
  },

  sendCurrentTargetLanguage: lng => {
    sendMessage('sendCurrentTargetLanguage', {
      targetLng: lng || api.i18n.getLng()
    })
  },

  addHandler: (action, fc) => {
    if (!handlers[action]) handlers[action] = []
    handlers[action].push(fc)
  },

  // legacy
  sendLocizeIsEnabled: () => {
    sendMessage('locizeIsEnabled', { enabled: true })
  },

  turnOn: () => {
    if (api.scriptTurnedOff) return sendMessage('forcedOff')

    if (!api.clickInterceptionEnabled) {
      window.document.body.addEventListener('click', api.clickHandler, true)
    }
    api.clickInterceptionEnabled = true
    sendMessage('turnedOn')
  },

  turnOff: () => {
    if (api.scriptTurnedOff) return sendMessage('forcedOff')

    if (api.clickInterceptionEnabled) {
      window.document.body.removeEventListener('click', api.clickHandler, true)
    }
    api.clickInterceptionEnabled = false
    sendMessage('turnedOff')
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

    if (message && handlers[message]) {
      handlers[message].forEach(fc => {
        fc(payload, e)
      })
    } else if (sender === 'i18next-editor-frame' && handlers[action]) {
      // console.warn('ok in', action, payload);
      handlers[action].forEach(fc => {
        fc(payload)
      })
    }
  })
}
