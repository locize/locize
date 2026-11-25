import { resetHighlight } from './ui/highlightNode.js'
import { isNodeStillInDocument } from './shadowRoots.js'

const data = {}

function clean () {
  Object.values(data).forEach(item => {
    if (!isNodeStillInDocument(item.node)) {
      // resetHighlight needs the item (it holds the overlay elements), not the id;
      // ignoreSelected false: the node is gone, a selection highlight must not outlive it
      resetHighlight(item, item.node, item.keys, false)
      delete data[item.id]
    }
  })
}

// textTarget: { node, index } for a translated text inside a text node: the text node, and which of
// its wrapped texts (i18next-subliminal unwrapAll) it is
function save (id, subliminal, type, meta, node, children, textTarget) {
  if (!id || !type || !meta || !node) return

  if (!data[id]) {
    data[id] = {
      id,
      node
    }
  }

  // per type: an element's text, its title and its placeholder each carry their own key
  if (subliminal) data[id].subliminals = { ...data[id].subliminals, [`${type}`]: subliminal }
  if (textTarget) data[id].textTargets = { ...data[id].textTargets, [`${type}`]: textTarget }

  data[id].keys = {
    ...data[id].keys,
    [`${type}`]: meta
  }

  if (children) {
    data[id].children = {
      ...data[id].children,
      [`${type}-${children.map(c => c.childIndex).join(',')}`]: children
    }
  }
}

// Drops the marked texts ('text', 'text#2', ...) past the first `count` of an element: it holds
// fewer translations than at the last parse (a condition turned one off, an edit removed a nested one)
function trimTexts (id, count) {
  const item = data[id]
  if (!item || !item.textTargets) return
  Object.keys(item.textTargets).forEach(type => {
    const position = type === 'text' ? 1 : parseInt(type.slice('text#'.length), 10)
    if (position <= count) return
    delete item.textTargets[type]
    if (item.subliminals) delete item.subliminals[type]
    delete item.keys[type]
  })
  if (!Object.keys(item.keys).length) {
    resetHighlight(item, item.node, item.keys, false)
    delete data[id]
  }
}

function get (id) {
  return data[id]
}

export const store = {
  save,
  clean,
  trimTexts,
  get,
  data
}
