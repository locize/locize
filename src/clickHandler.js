/* eslint-disable import/prefer-default-export */
import {
  getClickedElement,
  getElementText,
  getElementI18nKey,
  getElementNamespace,
} from './utils';

export function createClickHandler(cb, options) {
  // eslint-disable-next-line consistent-return
  const handler = (e) => {
    const el = getClickedElement(e);
    if (!el) return {};

    e.preventDefault();
    e.stopPropagation();

    const text = getElementText(el);
    const key = getElementI18nKey(el);

    const rectEl = el.getBoundingClientRect ? el : el.parentElement;
    const { top, left, width, height } = rectEl.getBoundingClientRect();

    const style = window.getComputedStyle(rectEl, null);
    const pT = parseFloat(style.getPropertyValue('padding-top'));
    const pB = parseFloat(style.getPropertyValue('padding-bottom'));
    const pR = parseFloat(style.getPropertyValue('padding-right'));
    const pL = parseFloat(style.getPropertyValue('padding-left'));
    const sizing = style.getPropertyValue('box-sizing');

    function getFallbackNS() {
      const i18next = options.getI18next();

      if (i18next && i18next.options && i18next.options.isLocizify)
        return i18next.options.defaultNS;
    }

    cb({
      tagName: rectEl.tagName,
      text,
      key,
      ns: getElementNamespace(el) || getFallbackNS(),
      box: {
        top,
        left,
        width: sizing === 'border-box' ? width : width - pR - pL,
        height: sizing === 'border-box' ? height : height - pT - pB,
      },
      style: style.cssText,
    });
  };

  return handler;
}
