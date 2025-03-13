import { api } from './postMessage.js'
import { store } from '../store.js'

import { setValueOnNode } from './handleEditKey.js'
import { recalcSelectedHighlight } from '../ui/highlightNode.js'

function handler (payload) {
  const { updated } = payload

  updated.forEach(item => {
    const { lng, ns, key, data, metas, meta } = item

    if (meta && data.value) setValueOnNode(meta, data.value)
    if (metas) {
      Object.values(metas).forEach(metaItem => {
        setValueOnNode(metaItem, data.value)
      })
    }

    api.i18n.setResource(lng, ns, key, data.value)

    // recalculate the highlight for selected nodes as those might have new sizes
    if (metas) {
      Object.values(metas).forEach(m => {
        const sItem = store.get(m.eleUniqueID)
        recalcSelectedHighlight(sItem, sItem.node, sItem.keys)
      })
    }
  })

  // reset all html - needed for react (gets confused on mutated children, eg. in Trans)
  Object.values(store.data).forEach(item => {
    if (item.originalChildNodes) {
      item.node.replaceChildren(...item.originalChildNodes)
    }
  })

  // emits editorSaved for i18next
  api.i18n.triggerRerender()

  // addLocizeSavedHandler
  if (api.locizeSavedHandler) api.locizeSavedHandler(payload)

  // window handler
  if (window.locizeSavedHandler) window.locizeSavedHandler(payload)
}

api.addHandler('commitKeys', handler)
