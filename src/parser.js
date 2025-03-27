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

  // parse node
  func(node)

  // check if it is is any store - if so remove parent from uninstrumented
  // this avoids situations where a div has inner text (not instrumented) and some children that are instrumented showing a big box around all
  const instr = store.get(node.uniqueID)
  const uninstr = uninstrumentedStore.get(node.uniqueID)

  if (instr || uninstr) {
    const id = node.parentElement?.uniqueID
    uninstrumentedStore.remove(id, node.parentElement)
  }

  // parse children
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

function storeIfQualifiedKey (
  id,
  subliminal,
  type,
  nodeI18nMeta,
  node,
  children,
  txt
) {
  // if we got some key, ns from locize and stored that - reuse it on this run
  const stored = store.get(id)
  const storedMeta = (stored && stored.keys[`${type}`]) || {}
  const typeMeta = nodeI18nMeta[`${type}`] || {}

  if (!typeMeta.key && storedMeta.key) typeMeta.key = storedMeta.key
  if (!typeMeta.ns && storedMeta.ns) typeMeta.ns = storedMeta.ns
  nodeI18nMeta[`${type}`] = typeMeta

  // extract metas
  const meta = extractNodeMeta(id, type, nodeI18nMeta, txt, children)

  // if we can 100% identify that ns:key store - else uninstrumented
  if (meta.qualifiedKey) {
    store.save(id, null, type, meta, node, children)
    uninstrumentedStore.removeKey(id, type, node)
  } else {
    uninstrumentedStore.save(id, type, node, txt)
  }
}

function handleNode (node) {
  if (ignoreElements.indexOf(node.nodeName) > -1) return

  const nodeI18nMeta = getI18nMetaFromNode(node)
  let usedSubliminalForText = false

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

      if (hasHiddenMeta) usedSubliminalForText = true

      // console.warn(
      //   'child',
      //   child,
      //   child.nodeName,
      //   child.innerText,
      //   hasHiddenStartMarker,
      //   hasHiddenMeta
      // )

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

        uninstrumentedStore.removeKey(node.uniqueID, 'html', node, txt) // might be instrumented later and already in uninstrumentedStore - so remove it there first
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
      }
    })

    // no subliminal in text
    if (!usedSubliminalForText) {
      node.childNodes.forEach((child, i) => {
        if (merge.length && child.nodeName !== '#text') {
          ignoreMergedEleUniqueIds.push(child.uniqueID)
          // merge.push({ childIndex: i, child }) // will be pushed regular below with txt
        }

        // if (child.nodeName !== '#text') return
        const txt = child.textContent
        // if (containsOnlySpaces(txt)) return

        // merge and add data-i18n=[html]key
        if (
          nodeI18nMeta &&
          nodeI18nMeta.html &&
          i < node.childNodes.length - 1
        ) {
          merge.push({ childIndex: i, child, text: txt })
        } else if (
          nodeI18nMeta &&
          nodeI18nMeta.html &&
          i === node.childNodes.length - 1
        ) {
          merge.push({ childIndex: i, child, text: txt })

          storeIfQualifiedKey(
            node.uniqueID,
            null,
            'html',
            nodeI18nMeta,
            node,
            merge,
            node.innerHTML
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

          // add data-i18n=key (inner text)
          if (nodeI18nMeta && nodeI18nMeta.text) {
            storeIfQualifiedKey(
              node.uniqueID,
              null,
              'text',
              nodeI18nMeta,
              node,
              undefined,
              txt
            )
          } else if (child.nodeName === '#text' && !containsOnlySpaces(txt)) {
            // if no metas at all and is a text node that is not just some spaces (html indent)
            // add to uninstrumented for a lookup (locize search)
            uninstrumentedStore.save(node.uniqueID, 'text', node, txt)
          }
        }
      })
    }
  }

  // test attibutes
  if (!node.getAttribute) return

  validAttributes.forEach(attr => {
    const txt = node.getAttribute(attr)
    if (containsHiddenMeta(txt)) {
      const meta = unwrap(txt)

      uninstrumentedStore.removeKey(node.uniqueID, attr, node) // might be instrumented later and already in uninstrumentedStore - so remove it there first
      store.save(
        node.uniqueID,
        meta.invisibleMeta,
        attr,
        extractHiddenMeta(node.uniqueID, `${attr}`, meta),
        node
      )
    } else if (txt) {
      if (nodeI18nMeta && nodeI18nMeta[attr]) {
        storeIfQualifiedKey(
          node.uniqueID,
          null,
          attr,
          nodeI18nMeta,
          node,
          undefined,
          txt
        )
      } else {
        uninstrumentedStore.save(node.uniqueID, attr, node, txt)
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
