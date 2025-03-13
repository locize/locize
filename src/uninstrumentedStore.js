import { resetHighlight } from './ui/highlightNode.js'

const data = {}

function clean () {
  Object.values(data).forEach(item => {
    if (!document.body.contains(item.node)) {
      resetHighlight(item.id, item.node)
      delete data[item.id]
    }
  })
}

function save (id, type, node, txt) {
  if (!id || !type || !node) return

  if (!data[id]) {
    data[id] = {
      id,
      node
    }
  }

  data[id].keys = {
    ...data[id].keys,
    [`${type}`]: { value: txt, eleUniqueID: id, textType: type }
  }
}

function remove (id, node) {
  resetHighlight(id, node)
  delete data[id]
}

function removeKey (id, key, node) {
  const item = get(id)
  if (!item) return

  delete item.keys[`${key}`]

  if (!Object.keys(item.keys).length) remove(id, node)
}

function get (id) {
  return data[id]
}

export const uninstrumentedStore = {
  save,
  remove,
  removeKey,
  clean,
  get,
  data
}
