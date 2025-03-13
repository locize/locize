import { api } from './postMessage.js'

import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'

import { extractNodeMeta } from '../parser.js'

function handler (payload) {
  if (!payload.length) return
  // console.warn(payload)
  // array of: {value: 'Welcome to test the i18next incontext editor', eleUniqueID: 9, textType: 'text', key: 'title', ns: 'translation', qualifiedKey: 'translation:title'}

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
    delete uni.keys[`${item.textType}`]
    if (!Object.keys(uni.keys).length)
      uninstrumentedStore.remove(item.eleUniqueID, uni.node)
  })

  api.sendCurrentParsedContent()

  // const { meta, value, lng } = payload
  // if (meta && value !== undefined) {
  //   // just make sure it is set
  //   setValueOnNode(meta, value)

  //   const usedLng = lng || api.i18n.getLng()
  //   api.i18n.setResource(usedLng, meta.ns, meta.key, value)
  //   api.i18n.triggerRerender()
  // }
}

api.addHandler('sendMatchedUninstrumented', handler)
