/* global DOMParser */
import { wrap } from 'i18next-subliminal'
import { api } from './postMessage.js'
import { store } from '../store.js'

// Attributes that are never legitimate translation targets. Event handlers
// (on*) execute script; `style` allows CSS-exfil patterns; `href`/`src`
// carry URL schemes that can execute script. The editor iframe (origin-
// validated upstream) is the only legitimate caller, but this is a
// defence-in-depth layer — even a bug in the iframe or a compromised
// translator tool cannot use postMessage to plant an `onclick=alert(1)`.
const DANGEROUS_ATTR_NAMES = /^(on\w+|style)$/i
const URL_ATTR_NAMES = /^(href|src|action|formaction|xlink:href)$/i
const DANGEROUS_URL_SCHEMES = /^\s*(javascript|data|vbscript|file)\s*:/i

function isSafeAttributeWrite (attr, value) {
  if (typeof attr !== 'string') return false
  if (DANGEROUS_ATTR_NAMES.test(attr)) return false
  if (URL_ATTR_NAMES.test(attr) && typeof value === 'string' && DANGEROUS_URL_SCHEMES.test(value)) return false
  return true
}

// Parse the translation HTML into a detached document, strip executable
// content (<script>, event handlers, javascript:/data:/vbscript:/file:
// URLs, and embedded navigation elements) and return the serialised result.
// Uses a throwaway document via DOMParser so the translation itself is not
// parsed into the live DOM during sanitisation (no side-effect fetches, no
// premature event firing). Legitimate translation formatting like <b>,
// <em>, <strong>, <a href="..."> survives.
function sanitizeTranslationHtml (html) {
  if (typeof html !== 'string') return html
  if (typeof DOMParser === 'undefined') return html
  try {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
    // Remove disallowed tags entirely (including their content)
    const disallowedTags = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'STYLE']
    disallowedTags.forEach(tag => {
      doc.body.querySelectorAll(tag.toLowerCase()).forEach(n => n.remove())
    })
    // Strip event handlers and dangerous URL schemes on remaining elements
    doc.body.querySelectorAll('*').forEach(n => {
      const attrs = Array.from(n.attributes)
      attrs.forEach(a => {
        const name = a.name
        const val = a.value
        if (/^on/i.test(name)) {
          n.removeAttribute(name)
          return
        }
        if (URL_ATTR_NAMES.test(name) && DANGEROUS_URL_SCHEMES.test(val)) {
          n.removeAttribute(name)
        }
      })
    })
    return doc.body.innerHTML
  } catch (e) {
    // On any parse failure, fall back to returning the raw value — the
    // outer origin-validation layer is still in place.
    return html
  }
}

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
    // Drop writes to dangerous attribute names (event handlers, style) and
    // reject javascript:/data:/vbscript:/file: URLs on href/src/action/etc.
    if (!isSafeAttributeWrite(attr, txtWithHiddenMeta)) return
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

    const sanitisedHtml = sanitizeTranslationHtml(txtWithHiddenMeta)

    // simple case - contains all inner HTML - so just replace it
    if (item.children[id].length === item.node.childNodes.length) {
      item.node.innerHTML = sanitisedHtml
    } else {
      // more complex...add somewhere in between
      const children = item.children[id]

      const first = children[0].child

      // append to dummy
      const dummy = document.createElement('div')
      dummy.innerHTML = sanitisedHtml

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
