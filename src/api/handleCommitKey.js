import { api } from './postMessage.js'

import { setValueOnNode } from './handleEditKey.js'

function handler (payload) {
  const { meta, value, lng } = payload
  if (meta && value !== undefined) {
    // just make sure it is set
    setValueOnNode(meta, value)

    const usedLng = lng || api.i18n.getLng()
    api.i18n.setResource(usedLng, meta.ns, meta.key, value)
    api.i18n.triggerRerender()
  }
}

api.addHandler('commitKey', handler)
