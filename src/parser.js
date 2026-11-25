import {
  unwrap,
  unwrapAll,
  containsHiddenMeta,
  containsHiddenStartMarker
} from 'i18next-subliminal'
import { store } from './store.js'
import { uninstrumentedStore } from './uninstrumentedStore.js'
import { validAttributes, ignoreElements } from './vars.js'
import { isShadowDOMEnabled } from './shadowRoots.js'
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
    uninstrumentedStore.remove(node.parentElement?.uniqueID)
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

  // with the `shadowDOM` option on, descend into an open shadow root as well:
  // `childNodes` stops at the shadow boundary, so text rendered inside a
  // shadow root would stay invisible to the editor
  if (isShadowDOMEnabled() && node.shadowRoot) walk(node.shadowRoot, func)
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
    uninstrumentedStore.removeKey(id, type)
  } else {
    uninstrumentedStore.save(id, type, node, txt)
  }
}

function handleNode (node) {
  if (ignoreElements.indexOf(node.nodeName) > -1) return

  const nodeI18nMeta = getI18nMetaFromNode(node)
  let usedSubliminalForText = false
  // translated texts directly in this element: 'text', then 'text#2', 'text#3'...
  let textCount = 0

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

      // Trim whitespace for subliminal marker detection — Angular/framework
      // templates add leading/trailing whitespace around interpolated text
      const trimmedTxt = txt.trim()
      const segments = unwrapAll(txt)
      const hasHiddenStartMarker = containsHiddenStartMarker(trimmedTxt)
      // Decided by where the translations in this node start. One without
      // its start marker here is the end of a translation begun in an
      // earlier node; a start marker at the beginning whose translation does
      // not end here begins one that spans several nodes (Trans, html), and
      // the translations inside it (a translated value) belong to it.
      const leading = txt.length - txt.trimStart().length
      const endsEarlier = segments.some(s => !containsHiddenStartMarker(txt.slice(s.start).trimStart()))
      const beginsSpanning = hasHiddenStartMarker && !segments.some(s => s.start <= leading)
      const closesMerge = merge.length > 0 && endsEarlier
      // Whole translations, also with text after them (`{{ t('name') }}:`).
      // Inside a spanning translation only a node that is one whole
      // translation, as before.
      const isText = merge.length
        ? !endsEarlier && hasHiddenStartMarker && containsHiddenMeta(trimmedTxt)
        : segments.length > 0 && !beginsSpanning

      if (segments.length) usedSubliminalForText = true

      // console.warn(
      //   'child',
      //   child,
      //   child.nodeName,
      //   child.innerText,
      //   hasHiddenStartMarker,
      //   segments
      // )

      if (isText) {
        // The text node holds one or more whole translations: its own
        // text, or a framework's template compiler joined a literal prefix
        // or several interpolations into one text node (Vue's
        // `<a>→ {{ t('goto.second') }}</a>`, `{{ t('a') }} {{ t('b') }}` in
        // Vue or Angular). Every translation gets its own key, so each
        // shows in the ribbon and a live edit replaces only its own text.
        //
        // Safe against regressions in other frameworks because:
        //   - i18next + React Trans: produces separate text nodes per
        //     segment, each one whole here.
        //   - vue-i18n split-marker (i18n-t component with slots): the
        //     first text starts with a start marker but no end marker and
        //     opens a merge, so `merge.length` is > 0 by the time the end
        //     marker comes; the merge then closes as 'html' below.
        //   - Stray invisible chars from other sources: `unwrapAll` only
        //     returns a translation whose end marker carries a readable key.
        uninstrumentedStore.remove(node.uniqueID) // might be instrumented later and already in uninstrumentedStore - so remove it there first
        segments.forEach((segment, index) => {
          textCount++
          const type = textCount === 1 ? 'text' : `text#${textCount}`
          store.save(
            node.uniqueID,
            segment.invisibleMeta,
            type,
            extractHiddenMeta(node.uniqueID, type, segment),
            node,
            undefined,
            { node: child, index }
          )
        })
      } else if (closesMerge) {
        merge.push({ childIndex: i, child, text: txt })

        const meta = unwrap(
          merge.reduce((mem, item) => {
            return mem + item.text
          }, '')
        )

        uninstrumentedStore.removeKey(node.uniqueID, 'html') // might be instrumented later and already in uninstrumentedStore - so remove it there first
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
      } else if (beginsSpanning || merge.length) {
        // begins a translation that spans several nodes, or is part of one
        merge.push({ childIndex: i, child, text: txt })
      }
    })

    // translations this element no longer has (the editor may still name them by type)
    store.trimTexts(node.uniqueID, textCount)

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

      uninstrumentedStore.removeKey(node.uniqueID, attr) // might be instrumented later and already in uninstrumentedStore - so remove it there first
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
  uninstrumentedStore.clean()

  // cleanup
  ignoreMergedEleUniqueIds = []

  return store.data
}
