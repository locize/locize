import { unwrap, containsHiddenMeta, containsHiddenStartMarker } from 'i18next-subliminal'
import { store } from './store.js'
import { uninstrumentedStore } from './uninstrumentedStore.js'
import { validAttributes } from './vars.js'

import './shims/uniqueID.js'

let currentSourceLng
let i18n
let ignoreMergedEleUniqueIds = [] // ignore elements that are part of a translation containing html

export function setImplementation (impl) {
  i18n = impl
}

function walk (node, func) {
  if (node.dataset && node.dataset.i18nextEditorElement === 'true') return
  func(node)

  const children = node.childNodes

  for (
    let i = 0;
    i < children.length;
    i++ // Children are siblings to each other
  ) { walk(children[i], func) }
}

function extractMeta (id, type, meta, children) {
  const { invisibleMeta, text } = meta
  if (!invisibleMeta || !invisibleMeta.key || !invisibleMeta.ns) return

  if (!currentSourceLng) currentSourceLng = i18n?.getSourceLng()

  return {
    eleUniqueID: id,
    textType: type,
    children: children ? children.map(c => c.childIndex).join(',') : null,
    qualifiedKey: `${invisibleMeta.ns}:${invisibleMeta.key}`,
    ...invisibleMeta,
    extractedText: text,
    i18nTargetLng: i18n?.getLng(),
    i18nSourceLng: currentSourceLng,
    i18nRawText: {
      [`${invisibleMeta.lng}`]:
        invisibleMeta.source === 'translation' && i18n
          ? i18n.getResource(invisibleMeta.lng, invisibleMeta.ns, invisibleMeta.key)
          : null,
      [`${currentSourceLng}`]:
        invisibleMeta.source === 'translation' && i18n
          ? i18n.getResource(currentSourceLng, invisibleMeta.ns, invisibleMeta.key)
          : null
    }
  }
}

function containsOnlySpaces (str) {
  return /^\s*$/.test(str)
}

function handleNode (node) {
  // test for inner text - but ignore text for elements merged to html containing translation
  if (node.childNodes && !ignoreMergedEleUniqueIds.includes(node.uniqueID)) {
    let merge = []
    node.childNodes.forEach((child, i) => {
      if (merge.length && child.nodeName !== '#text') {
        ignoreMergedEleUniqueIds.push(child.uniqueID)
        merge.push({ childIndex: i, child })
      }
      if (child.nodeName !== '#text') return

      const txt = child.textContent
      if (containsOnlySpaces(txt)) return

      const hasHiddenMeta = containsHiddenMeta(txt)
      const hasHiddenStartMarker = containsHiddenStartMarker(txt)

      // console.warn(
      //   'child',
      //   child,
      //   child.nodeName,
      //   child.innerText,
      //   hasHiddenStartMarker,
      //   hasHiddenMeta,
      // );

      if (hasHiddenStartMarker && hasHiddenMeta) {
        const meta = unwrap(txt)

        store.save(
          node.uniqueID,
          meta.invisibleMeta,
          'text',
          extractMeta(node.uniqueID, 'text', meta),
          node
        )
      } else if (hasHiddenStartMarker) {
        merge.push({ childIndex: i, child, text: txt })
      } else if (merge.length && !hasHiddenMeta) {
        merge.push({ childIndex: i, child, text: txt })
      } else if (merge.length && hasHiddenMeta) {
        merge.push({ childIndex: i, child, text: txt })

        const meta = unwrap(
          merge.reduce((mem, item) => {
            return mem + item.text
          }, '')
        )

        store.save(
          node.uniqueID,
          meta.invisibleMeta,
          'html',
          extractMeta(node.uniqueID, 'html', meta, merge),
          node,
          merge
        )

        // reset
        merge = []
      } else if (txt) {
        uninstrumentedStore.save(node.uniqueID, 'text', node)
      }
    })
  }

  // test attibutes
  if (!node.getAttribute) return

  validAttributes.forEach(attr => {
    const txt = node.getAttribute(attr)
    if (containsHiddenMeta(txt)) {
      const meta = unwrap(txt)

      store.save(
        node.uniqueID,
        meta.invisibleMeta,
        `attr:${attr}`,
        extractMeta(node.uniqueID, `attr:${attr}`, meta),
        node
      )
    } else if (txt) {
      uninstrumentedStore.save(node.uniqueID, `attr:${attr}`, node)
    }
  })

  // TODO: how to handle react Trans things?!?
}

export function parseTree (node) {
  // reset
  currentSourceLng = undefined

  // walk
  walk(node, handleNode)
  store.clean()

  // cleanup
  ignoreMergedEleUniqueIds = []

  return store.data
}
