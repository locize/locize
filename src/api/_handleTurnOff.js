import { api } from './postMessage.js'

function handler (payload, e) {
  // done
  api.turnOff()
}

api.addHandler('turnOff', handler)
