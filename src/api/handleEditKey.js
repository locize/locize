import { wrap } from 'i18next-subliminal'
import { api } from './postMessage.js'
import { store } from '../store.js'

export function setValueOnNode (meta, value) {
  const item = store.get(meta.eleUniqueID)

  // check if we have an item and that item has same textType
  if (!item || !item.keys[meta.textType]) return

  const txtWithHiddenMeta = item.subliminal
    ? wrap(value, item.subliminal)
    : value

  if (meta.textType === 'text') {
    item.node.textContent = txtWithHiddenMeta
  } else if (meta.textType.indexOf('attr:') === 0) {
    const attr = meta.textType.replace('attr:', '')
    item.node.setAttribute(attr, txtWithHiddenMeta)
  } else if (meta.textType === 'html') {
    const id = `${meta.textType}-${meta.children}`

    if (!item.originalChildNodes) {
      const clones = []
      item.node.childNodes.forEach(c => {
        // clones.push(c.cloneNode(true));
        clones.push(c) // react needs the original nodes to rerender them
      })
      item.originalChildNodes = clones
    }

    // simple case - contains all inner HTML - so just replace it
    if (item.children[id].length === item.node.childNodes.length) {
      item.node.innerHTML = txtWithHiddenMeta
    } else {
      // more complex...add somewhere in between
      const children = item.children[id]

      const first = children[0].child

      // append to dummy
      const dummy = document.createElement('div')
      dummy.innerHTML = txtWithHiddenMeta

      // loop over all childs and append them to source node before first child (the one having the startMarker)
      const nodes = []
      dummy.childNodes.forEach(c => {
        nodes.push(c)
      })

      nodes.forEach(c => {
        try {
          item.node.insertBefore(c, first)
        } catch (error) {
          item.node.appendChild(c)
        }
      })

      // remove old stuff (startMarker to endHiddenMeta)
      children.forEach(replaceable => {
        if (item.node.contains(replaceable.child)) { item.node.removeChild(replaceable.child) }
      })
    }
  }
}

function handler (payload) {
  const { meta, value } = payload
  if (meta && value !== undefined) {
    setValueOnNode(meta, value)
  }
}

api.addHandler('editKey', handler)
