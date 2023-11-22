import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'
import { isInViewport, mouseDistanceFromElement } from './utils.js'
import { debounce } from '../utils.js'
import {
  highlight,
  highlightUninstrumented,
  resetHighlight
} from './highlightNode.js'

const debouncedUpdateDistance = debounce(function (e, observer) {
  Object.values(store.data).forEach(item => {
    // if not visible do not calculate distance of mouse
    if (!isInViewport(item.node)) return

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
