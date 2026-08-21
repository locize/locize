import { store } from '../store.js'
import { uninstrumentedStore } from '../uninstrumentedStore.js'
import { isInViewport, mouseDistanceFromElement } from './utils.js'
import { debounce } from '../utils.js'
import { isShadowDOMEnabled } from '../shadowRoots.js'
import {
  highlight,
  highlightUninstrumented,
  repositionOverlays,
  resetHighlight
} from './highlightNode.js'

// `document.elementFromPoint` stops at a shadow host and returns the host
// itself, so a node inside a shadow root always looked occluded by its own
// host. With the `shadowDOM` option on, drill through (possibly nested)
// shadow roots to reach the real element under the point.
function deepElementFromPoint (x, y) {
  let el = document.elementFromPoint(x, y)
  if (!isShadowDOMEnabled()) return el

  while (el && el.shadowRoot) {
    const inner = el.shadowRoot.elementFromPoint(x, y)
    if (!inner || inner === el) break
    el = inner
  }

  return el
}

// our own overlays: they sit on top of the very node they belong to, so they
// must never count as something covering it
const ownOverlaySelector =
  '.i18next-editor-highlight, .i18next-editor-button-container, .i18next-editor-button'

// the chrome this script itself puts on the page - the popup (with its header,
// iframe and drag overlay) and the minimized ribbon. Deliberately matched by id
// and class rather than by `data-i18next-editor-element`: that attribute is also
// set by host applications on their own containers (the locize app marks its
// whole `#root` with it so an embedding editor skips it), and treating those as
// chrome would suppress highlighting across the entire host page.
const editorChromeSelector = '#i18next-editor-popup, .locize-incontext-ribbon'

// Is this point covered by something other than the node itself?
function coveredAt (node, x, y) {
  const topEl = deepElementFromPoint(x, y)
  if (!topEl) return true

  // Our own hover overlays sit on top of the node they belong to and must not
  // count as covering it; the editor chrome really does cover the page, and
  // treating both alike is why keys behind the popup stayed highlightable.
  if (topEl.closest && topEl.closest(ownOverlaySelector)) return false
  if (topEl.closest && topEl.closest(editorChromeSelector)) return true

  // The element at point should be the node itself or a descendant/ancestor
  return !node.contains(topEl) && !topEl.contains(node)
}

// Check if a node is visually covered by another element (e.g. modal backdrop)
function isOccluded (node, e) {
  const rect = node.getBoundingClientRect()
  if (!rect.width || !rect.height) return true

  // Check the center point of the element
  if (!coveredAt(node, rect.left + rect.width / 2, rect.top + rect.height / 2)) return false

  // The centre is covered - but a wide element can reach under an overlay while
  // the part the cursor actually sits on stays visible (a table row running
  // under the editor popup). Re-test at the cursor, and only when the cursor is
  // within this element: this can only ever rescue an element the centre test
  // rejected, never occlude one it cleared, so the proximity tolerance below
  // keeps working for everything the cursor is not on.
  if (
    e && typeof e.clientX === 'number' &&
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom
  ) {
    return coveredAt(node, e.clientX, e.clientY)
  }

  return true
}

// A highlight box is positioned in page coordinates when it is created, so an
// item that is off-screen with a box still owns a visible overlay somewhere in
// the document. The viewport check below therefore skips the *highlighting*
// work for such items, but never the reset. A selected key's box is deliberately
// left alone (resetHighlight's default ignoreSelected guard): the selection
// outlives scrolling, only hover highlights are cleared here.
function hasOverlay (item) {
  return !!(item.highlightBox || item.ribbonBox)
}

// The cursor sitting on the editor's own chrome - the popup, its iframe, its
// drag overlay - must not highlight anything underneath it. This is checked once
// per recompute at the cursor, not per item, because the per-item test below
// looks at each element's *centre*: a wide paragraph that the popup only partly
// covers has its centre out in the open, so that test cannot see this case at
// all. Our own overlays are excluded, so hovering a ribbon still keeps its
// highlight.
function cursorOverEditorChrome (e) {
  if (!e || typeof e.clientX !== 'number') return false

  const topEl = deepElementFromPoint(e.clientX, e.clientY)
  if (!topEl || !topEl.closest) return false
  if (topEl.closest(ownOverlaySelector)) return false

  return !!topEl.closest(editorChromeSelector)
}

const debouncedUpdateDistance = debounce(function (e, observer) {
  if (cursorOverEditorChrome(e)) {
    Object.values(store.data).concat(Object.values(uninstrumentedStore.data))
      .forEach(item => { if (hasOverlay(item)) resetHighlight(item, item.node, item.keys) })
    return
  }

  Object.values(store.data).forEach(item => {
    // an existing overlay may belong to content that has moved (container
    // scroll, reflow above it) - realign it in place first. Matters most for
    // a selected key's box, which the resets below deliberately leave alone.
    if (item.highlightBox) repositionOverlays(item, item.node)
    // if not visible do not calculate distance of mouse - but do clear a
    // highlight it may still be holding, it cannot be under the mouse
    if (!isInViewport(item.node)) {
      if (hasOverlay(item)) resetHighlight(item, item.node, item.keys)
      return
    }
    // if covered by modal/overlay do not highlight
    if (isOccluded(item.node, e)) { resetHighlight(item, item.node, item.keys); return }

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
    // an existing overlay may belong to content that has moved (container
    // scroll, reflow above it) - realign it in place first. Matters most for
    // a selected key's box, which the resets below deliberately leave alone.
    if (item.highlightBox) repositionOverlays(item, item.node)
    // if not visible do not calculate distance of mouse - but do clear a
    // highlight it may still be holding, it cannot be under the mouse
    if (!isInViewport(item.node)) {
      if (hasOverlay(item)) resetHighlight(item, item.node, item.keys)
      return
    }
    // if covered by modal/overlay do not highlight
    if (isOccluded(item.node, e)) { resetHighlight(item, item.node, item.keys); return }

    const distance = mouseDistanceFromElement(e, item.node)
    if (distance < 10) {
      highlightUninstrumented(item, item.node, item.keys)
    } else if (distance > 10) {
      resetHighlight(item, item.node, item.keys)
    }
  })
}, 50)

let currentFC
let scrollFC
let overFC
// last known mouse position, in viewport coordinates
let lastClientX = 0
let lastClientY = 0
let hasLastMouse = false

export function startMouseTracking (observer) {
  // drop any previous handlers first: start is called again on drag/resize end,
  // popup restore and turnOn, and each call built a fresh closure - rebinding
  // without unbinding leaked a listener that nothing could remove afterwards
  stopMouseTracking()

  currentFC = function handle (e) {
    lastClientX = e.clientX
    lastClientY = e.clientY
    hasLastMouse = true

    debouncedUpdateDistance(e, observer)
  }
  document.addEventListener('mousemove', currentFC)

  // Highlights used to be recomputed on mousemove only, so scrolling with the
  // mouse held still left them behind: a highlight box is positioned in page
  // coordinates, it scrolls away together with the content and nothing ever
  // cleared it. Run the same distance check on scroll, rebuilding the mouse
  // page position from its last viewport position plus the current scroll
  // offset - the mouse did not move, the content under it did.
  scrollFC = function handleScroll () {
    if (!hasLastMouse) return

    const scrollX = window.scrollX || 0
    const scrollY = window.scrollY || 0

    // pageX/pageY for mouseDistanceFromElement, clientX/clientY for isOccluded
    debouncedUpdateDistance({
      pageX: lastClientX + scrollX,
      pageY: lastClientY + scrollY,
      clientX: lastClientX,
      clientY: lastClientY
    }, observer)
  }
  // Capture phase: `scroll` does not bubble, and the page may well scroll in a
  // container instead of the document itself.
  window.addEventListener('scroll', scrollFC, true)

  // Moving onto the editor's iframe is the last thing this document gets to
  // see: the iframe is cross-origin, so no mousemove from inside it is ever
  // delivered here, and a highlight created on the last event before the
  // boundary would simply stay there for as long as the cursor is in the
  // editor. `mouseover` on the iframe element itself still fires in this
  // document - route it through the same check so those highlights get cleared.
  overFC = function handleOver (e) {
    if (cursorOverEditorChrome(e)) debouncedUpdateDistance(e, observer)
  }
  document.addEventListener('mouseover', overFC, true)
}

export function stopMouseTracking () {
  document.removeEventListener('mousemove', currentFC)
  if (scrollFC) window.removeEventListener('scroll', scrollFC, true)
  if (overFC) document.removeEventListener('mouseover', overFC, true)
}
