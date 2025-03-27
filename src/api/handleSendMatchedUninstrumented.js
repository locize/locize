import { api } from './postMessage.js'

import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'

import { extractNodeMeta } from '../parser.js'

function handler (payload) {
  if (!payload.length) return

  payload.forEach(item => {
    // remove from store
    const uni = uninstrumentedStore.get(item.eleUniqueID)

    // save valid element
    store.save(
      item.eleUniqueID,
      undefined,
      item.textType,
      extractNodeMeta(
        item.eleUniqueID,
        item.textType,
        { [`${item.textType}`]: { ns: item.ns, key: item.key } },
        item.value
      ),
      uni?.node
    )

    // remove uninstrumented
    if (uni && uni.keys) delete uni.keys[`${item.textType}`]
    if (uni && uni.keys && !Object.keys(uni.keys).length) { uninstrumentedStore.remove(item.eleUniqueID, uni.node) }
  })

  api.sendCurrentParsedContent()
}

api.addHandler('sendMatchedUninstrumented', handler)
