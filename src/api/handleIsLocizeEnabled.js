import { api } from './postMessage.js'

function handler (payload, e) {
  // console.warn('here', payload, e.source, e.origin)

  // set source
  api.source = e.source
  api.origin = e.origin

  // no longer supported
  // if (!payload || payload.version !== 'v2') api.legacy = true

  // done
  api.sendLocizeIsEnabled(payload)
  api.requestInitialize(api.config)
}

api.addHandler('isLocizeEnabled', handler)
