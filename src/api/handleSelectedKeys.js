import { api } from './postMessage.js'
import { store } from '../store.js'

import { selectedHighlight, resetHighlight } from '../ui/highlightNode.js'

let previousMatches = []
function handler (payload) {
  const { keys } = payload

  const matchingItems = []
  Object.values(store.data).forEach(item => {
    const matches = Object.values(item.keys).filter(k => keys.includes(k.qualifiedKey))

    if (matches.length) {
      matchingItems.push(item)
    }
  })

  // deselect
  previousMatches.forEach(item => {
    resetHighlight(item, item.node, item.keys, false)
  })

  // select
  matchingItems.forEach(item => {
    selectedHighlight(item, item.node, item.keys)
  })

  previousMatches = matchingItems
}

api.addHandler('selectedKeys', handler)
