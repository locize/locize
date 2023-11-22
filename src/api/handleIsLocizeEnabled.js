import { api } from './postMessage.js'

function handler (payload, e) {
  // set source
  api.source = e.source
  api.origin = e.origin
  api.legacy = true

  // done
  api.sendLocizeIsEnabled()
}

api.addHandler('isLocizeEnabled', handler)
