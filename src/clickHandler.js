/* eslint-disable import/prefer-default-export */
import { getClickedElement, getElementText, getElementNamespace } from './utils';

export function createClickHandler(cb) {

  // eslint-disable-next-line consistent-return
  const handler = (e) => {
    const el = getClickedElement(e);
    if (!el) return {};

    e.preventDefault();
    e.stopPropagation();

    const text = getElementText(el);
    const {
      top, left, width, height
    } = el.getBoundingClientRect();

    const style = window.getComputedStyle(el, null);
    const pT = parseFloat(style.getPropertyValue('padding-top'));
    const pB = parseFloat(style.getPropertyValue('padding-bottom'));
    const pR = parseFloat(style.getPropertyValue('padding-right'));
    const pL = parseFloat(style.getPropertyValue('padding-left'));
    const sizing = style.getPropertyValue('box-sizing');

    cb({
      tagName: el.tagName,
      text,
      ns: getElementNamespace(el),
      box: {
        top,
        left,
        width: sizing === 'border-box' ? width : width - pR - pL,
        height: sizing === 'border-box' ? height : height - pT - pB
      },
      style: style.cssText
    });
  };

  return handler;
}
