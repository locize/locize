import {
  unwrap,
  containsHiddenMeta
} from 'i18next-subliminal'

/* eslint-disable import/prefer-default-export */
import {
  getClickedElement,
  getElementText,
  getElementI18nKey,
  getElementNamespace
} from './utils.js'

export function createClickHandler (cb, options = {}) {
  // eslint-disable-next-line consistent-return
  const handler = e => {
    const el = getClickedElement(e)
    if (!el) return {}

    e.preventDefault()
    e.stopPropagation()

    // eslint-disable-next-line consistent-return
    function getFallbackNS () {
      if (options.isLocizify) return options.defaultNS
    }

    const text = getElementText(el)
    let key = getElementI18nKey(el)
    let ns = getElementNamespace(el) || getFallbackNS()

    // use subliminal info if available
    if (containsHiddenMeta(text)) {
      const meta = unwrap(text)

      if (meta && meta.invisibleMeta && meta.invisibleMeta.key) { key = meta.invisibleMeta.key }
      if (meta && meta.invisibleMeta && meta.invisibleMeta.ns) { ns = meta.invisibleMeta.ns }
    }

    const rectEl = el.getBoundingClientRect ? el : el.parentElement
    const { top, left, width, height } = rectEl.getBoundingClientRect()

    const style = window.getComputedStyle(rectEl, null)
    const pT = parseFloat(style.getPropertyValue('padding-top'))
    const pB = parseFloat(style.getPropertyValue('padding-bottom'))
    const pR = parseFloat(style.getPropertyValue('padding-right'))
    const pL = parseFloat(style.getPropertyValue('padding-left'))
    const sizing = style.getPropertyValue('box-sizing')

    // eslint-disable-next-line n/no-callback-literal
    cb({
      tagName: rectEl.tagName,
      text,
      key,
      ns,
      box: {
        top,
        left,
        width: sizing === 'border-box' ? width : width - pR - pL,
        height: sizing === 'border-box' ? height : height - pT - pB
      },
      style: style.cssText
    })
  }

  return handler
}
