import { api } from './postMessage.js'

function handler (payload) {
  api.initialized = true
  clearInterval(api.initInterval)
  delete api.initInterval
  api.sendCurrentParsedContent()
  api.sendCurrentTargetLanguage()
}

api.addHandler('confirmInitialized', handler)
