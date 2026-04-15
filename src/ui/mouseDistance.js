import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'
import { isInViewport, mouseDistanceFromElement } from './utils.js'
import { debounce } from '../utils.js'
import {
  highlight,
  highlightUninstrumented,
  resetHighlight
} from './highlightNode.js'

// Check if a node is visually covered by another element (e.g. modal backdrop)
function isOccluded (node) {
  const rect = node.getBoundingClientRect()
  if (!rect.width || !rect.height) return true

  // Check the center point of the element
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const topEl = document.elementFromPoint(x, y)
  if (!topEl) return true

  // Ignore our own editor overlay elements (highlight boxes, ribbon boxes, etc.)
  if (topEl.dataset && topEl.dataset.i18nextEditorElement === 'true') return false

  // The element at point should be the node itself or a descendant/ancestor
  return !node.contains(topEl) && !topEl.contains(node)
}

const debouncedUpdateDistance = debounce(function (e, observer) {
  Object.values(store.data).forEach(item => {
    // if not visible do not calculate distance of mouse
    if (!isInViewport(item.node)) return
    // if covered by modal/overlay do not highlight
    if (isOccluded(item.node)) { resetHighlight(item, item.node, item.keys); return }

    const distance = mouseDistanceFromElement(e, item.node)
    if (distance < 5) {
      highlight(item, item.node, item.keys)
    } else if (distance > 5) {
      // check if we are over the ribbonbox
      const boxDistance = item.ribbonBox
        ? mouseDistanceFromElement(e, item.ribbonBox)
        : 1000
      if (boxDistance > 10) resetHighlight(item, item.node, item.keys)
    }
  })

  Object.values(uninstrumentedStore.data).forEach(item => {
    // if not visible do not calculate distance of mouse
    if (!isInViewport(item.node)) return
    // if covered by modal/overlay do not highlight
    if (isOccluded(item.node)) { resetHighlight(item, item.node, item.keys); return }

    const distance = mouseDistanceFromElement(e, item.node)
    if (distance < 10) {
      highlightUninstrumented(item, item.node, item.keys)
    } else if (distance > 10) {
      resetHighlight(item, item.node, item.keys)
    }
  })
}, 50)

let currentFC

export function startMouseTracking (observer) {
  currentFC = function handle (e) {
    debouncedUpdateDistance(e, observer)
  }
  document.addEventListener('mousemove', currentFC)
}

export function stopMouseTracking () {
  document.removeEventListener('mousemove', currentFC)
}
