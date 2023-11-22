import { api } from './postMessage.js'

function handler (payload, e) {
  // done
  api.turnOn()
}

api.addHandler('turnOn', handler)
