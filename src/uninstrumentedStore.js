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

function save (id, type, node) {
  if (!id || !type || !node) return

  if (!data[id]) {
    data[id] = {
      id,
      node
    }
  }

  data[id].keys = {
    ...data[id].keys,
    [`${type}`]: 'uninstrumented'
  }
}

function get (id) {
  return data[id]
}

export const uninstrumentedStore = {
  save,
  clean,
  get,
  data
}
