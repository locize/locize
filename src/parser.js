import {
  unwrap,
  containsHiddenMeta,
  containsHiddenStartMarker
} from 'i18next-subliminal'
import { store } from './store.js'
import { uninstrumentedStore } from './uninstrumentedStore.js'
import { validAttributes, ignoreElements } from './vars.js'
import { getI18nMetaFromNode } from './utils'

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
  ) {
    walk(children[i], func)
  }
}

function extractHiddenMeta (id, type, meta, children) {
  const { invisibleMeta, text } = meta
  if (!invisibleMeta || !invisibleMeta.key || !invisibleMeta.ns) return

  if (!currentSourceLng) currentSourceLng = i18n.getSourceLng()

  return {
    eleUniqueID: id,
    textType: type,
    children:
      children && children.map
        ? children.map(c => c.childIndex).join(',')
        : null,
    qualifiedKey: `${invisibleMeta.ns}:${invisibleMeta.key}`,
    ...invisibleMeta,
    extractedText: text,
    i18nTargetLng: i18n?.getLng(),
    i18nSourceLng: currentSourceLng,
    i18nRawText: {
      [`${invisibleMeta.lng}`]:
        invisibleMeta.source === 'translation' && i18n
          ? i18n?.getResource(
              invisibleMeta.lng,
              invisibleMeta.ns,
              invisibleMeta.key
            )
          : null,
      [`${currentSourceLng}`]:
        invisibleMeta.source === 'translation' && i18n
          ? i18n?.getResource(
              currentSourceLng,
              invisibleMeta.ns,
              invisibleMeta.key
            )
          : null
    }
  }
}

export function extractNodeMeta (id, type, nodeMeta = {}, text, children) {
  const meta = nodeMeta[type]
  if (!meta) return

  if (!currentSourceLng) currentSourceLng = i18n.getSourceLng()
  const i18nTargetLng = i18n.getLng()

  // console.warn('lng', i18nTargetLng)

  return {
    eleUniqueID: id,
    textType: type,
    children:
      children && children.map
        ? children.map(c => c.childIndex).join(',')
        : null,
    qualifiedKey:
      meta.key && (meta.ns || i18n?.getDefaultNS())
        ? `${meta.ns || i18n?.getDefaultNS()}:${meta.key}`
        : null,
    key: meta.key,
    ns: meta.ns || i18n?.getDefaultNS(),
    extractedText: text,
    i18nTargetLng,
    i18nSourceLng: currentSourceLng,
    i18nRawText: {
      [`${i18nTargetLng}`]:
        i18n && meta.ns && meta.key
          ? i18n?.getResource(i18nTargetLng, meta.ns, meta.key) || text
          : text,
      [`${currentSourceLng}`]:
        i18n && meta.ns && meta.key
          ? i18n?.getResource(currentSourceLng, meta.ns, meta.key)
          : null
    }
  }
}

function containsOnlySpaces (str) {
  return /^\s*$/.test(str)
}

function handleNode (node) {
  if (ignoreElements.indexOf(node.nodeName) > -1) return

  const nodeI18nMeta = getI18nMetaFromNode(node)

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

        uninstrumentedStore.remove(node.uniqueID, node) // might be instrumented later and already in uninstrumentedStore - so remove it there first
        store.save(
          node.uniqueID,
          meta.invisibleMeta,
          'text',
          extractHiddenMeta(node.uniqueID, 'text', meta),
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

        uninstrumentedStore.remove(node.uniqueID, node, txt) // might be instrumented later and already in uninstrumentedStore - so remove it there first
        store.save(
          node.uniqueID,
          meta.invisibleMeta,
          'html',
          extractHiddenMeta(node.uniqueID, 'html', meta, merge),
          node,
          merge
        )

        // reset
        merge = []
      } else if (txt) {
        // console.warn(
        //   'nodeI18nMeta',
        //   txt,
        //   nodeI18nMeta,
        //   hasHiddenMeta,
        //   hasHiddenStartMarker
        // )
        if (nodeI18nMeta && nodeI18nMeta['text']) {
          store.save(
            node.uniqueID,
            null,
            'text',
            extractNodeMeta(node.uniqueID, 'text', nodeI18nMeta, txt),
            node
          )
        } else {
          uninstrumentedStore.save(node.uniqueID, 'text', node, txt)
        }
      }
    })
  }

  // test attibutes
  if (!node.getAttribute) return

  validAttributes.forEach(attr => {
    const txt = node.getAttribute(attr)
    if (containsHiddenMeta(txt)) {
      const meta = unwrap(txt)

      uninstrumentedStore.remove(node.uniqueID, node) // might be instrumented later and already in uninstrumentedStore - so remove it there first
      store.save(
        node.uniqueID,
        meta.invisibleMeta,
        `attr:${attr}`,
        extractHiddenMeta(node.uniqueID, `attr:${attr}`, meta),
        node
      )
    } else if (txt) {
      if (nodeI18nMeta && nodeI18nMeta[attr]) {
        store.save(
          node.uniqueID,
          null,
          attr,
          extractNodeMeta(node.uniqueID, attr, nodeI18nMeta, txt, node),
          node
        )
      } else {
        uninstrumentedStore.save(node.uniqueID, `attr:${attr}`, node)
      }
    }
  })

  // console.warn('store', store)

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
