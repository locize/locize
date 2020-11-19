export function isWindow(obj) {
  return obj != null && obj === obj.window;
}

export function getWindow(elem) {
  return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

export function offset(elem) {
  let box = {
    top: 0, left: 0, right: 0, bottom: 0
  };
  const doc = elem && elem.ownerDocument;

  const docElem = doc && doc.documentElement;
  if (!docElem) return box;

  if (typeof elem.getBoundingClientRect !== typeof undefined) {
    box = elem.getBoundingClientRect();
  }
  const win = getWindow(doc);

  const top = box.top + win.pageYOffset - docElem.clientTop;
  const left = box.left + win.pageXOffset - docElem.clientLeft;
  return {
    top,
    left,
    right: left + (box.right - box.left),
    bottom: top + (box.bottom - box.top)
  };
}

export function getClickedElement(e) {
  // clicked input
  if (e.srcElement && e.srcElement.nodeType === 1) {
    if (e.srcElement.getAttribute && e.srcElement.getAttribute('ignorelocizeeditor') === '') return null;
    return e.srcElement;
  }

  let el; let
    toLeft;

  if (e.originalEvent && e.originalEvent.explicitOriginalTarget) {
    el = e.originalEvent.explicitOriginalTarget;
  } else {
    const parent = e.srcElement;
    if (parent.getAttribute && parent.getAttribute('ignorelocizeeditor') === '') return null;

    const left = e.pageX;
    const top = e.pageY;
    // let pOffset = offset(parent);
    // console.warn('click', top, left);
    // console.warn('parent', parent, pOffset, parent.clientHeight, parent.offsetHeight);

    let topStartsAt = 0;
    let topBreaksAt;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < parent.childNodes.length; i++) {
      const n = parent.childNodes[i];
      const nOffset = offset(n);
      // console.warn('child', n, nOffset, n.clientHeight, n.offsetHeight)

      // if a node is with the bottom over the top click set the next child as start index
      if (n.nodeType === 1 && nOffset.bottom < top) topStartsAt = i + 1;

      // if node is below top click set end index to this node
      if (!topBreaksAt && nOffset.top + (n.clientHeight || 0) > top) topBreaksAt = i;
    }

    // check we are inside children lenght
    if (topStartsAt + 1 > parent.childNodes.length) topStartsAt = parent.childNodes.length - 1;
    if (!topBreaksAt) topBreaksAt = parent.childNodes.length;
    // console.warn('bound', topStartsAt, topBreaksAt)

    // inside our boundaries check when left is to big and out of clicks left
    // eslint-disable-next-line no-plusplus
    for (let y = topStartsAt; y < topBreaksAt; y++) {
      const n = parent.childNodes[y];
      const nOffset = offset(n);

      if (!toLeft && nOffset.left > left) {
        break;
      }

      if (n && n.nodeType !== 8) el = n;
    }
  }
  return el;
}

export function getElementText(el) {
  const str = el.textContent || (el.text && el.text.innerText) || el.placeholder;
  if (typeof str !== 'string') return;
  // eslint-disable-next-line consistent-return
  return str.replace(/\n +/g, '').trim();
}

function getAttribute(el, name) {
  return el && el.getAttribute && el.getAttribute(name);
}

export function getElementNamespace(el) {

  let found;

  const find = (ele) => {
    let opts = getAttribute(ele, 'i18next-options');
    if (!opts) opts = getAttribute(ele, 'data-i18next-options');
    if (!opts) opts = getAttribute(ele, 'i18n-options');
    if (!opts) opts = getAttribute(ele, 'data-i18n-options');
    if (opts) {
      let jsonData = {};
      try {
        jsonData = JSON.parse(opts);
      } catch (e) {
        // not our problem here in editor
      }
      if (jsonData.ns) found = jsonData.ns;
    }
    if (!found) found = getAttribute(ele, 'i18next-ns');
    if (!found) found = getAttribute(ele, 'data-i18next-ns');
    if (!found) found = getAttribute(ele, 'i18n-ns');
    if (!found) found = getAttribute(ele, 'data-i18n-ns');
    if (!found && ele.parentElement) find(ele.parentElement);
  };
  find(el);

  return found;
}
