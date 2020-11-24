export function isWindow(obj) {
  return obj != null && obj === obj.window;
}

export function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

export function offset(elem) {
  var docElem, win,
      box = { top: 0, left: 0, right: 0, bottom: 0 },
      doc = elem && elem.ownerDocument;

  docElem = doc && doc.documentElement;
	if (!docElem) return box;

  if (typeof elem.getBoundingClientRect !== typeof undefined) {
    box = elem.getBoundingClientRect();
  }
  win = getWindow(doc);

  const top = box.top + win.pageYOffset - docElem.clientTop;
  const left = box.left + win.pageXOffset - docElem.clientLeft;
  return {
    top,
    left,
    right: left + (box.right - box.left),
    bottom: top + (box.bottom - box.top)
  };
};

export function getClickedElement(e) {
  // clicked input
  if (e.srcElement && e.srcElement.nodeType === 1 && (e.srcElement.nodeName === 'BUTTON' || e.srcElement.nodeName === 'INPUT')) {
    if (e.srcElement.getAttribute && e.srcElement.getAttribute('ignorelocizeeditor') === '') return null;
    return e.srcElement;
  }

  let el, toLeft;

  if (e.originalEvent && e.originalEvent.explicitOriginalTarget) {
    el = e.originalEvent.explicitOriginalTarget;
  } else {
    let parent = e.srcElement;
    if (parent.getAttribute && parent.getAttribute('ignorelocizeeditor') === '') return null;

    let left = e.pageX;
    let top = e.pageY;
    // let pOffset = offset(parent);
    // console.warn('click', top, left);
    // console.warn('parent', parent, pOffset, parent.clientHeight, parent.offsetHeight);

    let topStartsAt = 0;
    let topBreaksAt;
    for (let i = 0; i < parent.childNodes.length; i++) {
      let n = parent.childNodes[i];
      let nOffset = offset(n);
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
    for (let y = topStartsAt; y < topBreaksAt; y++) {
      let n = parent.childNodes[y];
      let nOffset = offset(n);

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
  return str.replace(/\n +/g, '').trim();
}



function getAttribute(el, name) {
return el && el.getAttribute && el.getAttribute(name);
}

export function getElementNamespace(el) {


    let found;

    const find = (el) => {
      let opts = getAttribute(el, 'i18next-options')
      if (!opts) opts = getAttribute(el, 'data-i18next-options');
      if (!opts) opts = getAttribute(el, 'i18n-options');
      if (!opts) opts = getAttribute(el, 'data-i18n-options');
      if (opts) {
        let jsonData = {};
        try {
          jsonData = JSON.parse(opts);
        } catch (e) {
          // not our problem here in editor
        }
        if (jsonData.ns) found = jsonData.ns
      }
      if (!found) found = getAttribute(el, 'i18next-ns');
      if (!found) found = getAttribute(el, 'data-i18next-ns');
      if (!found) found = getAttribute(el, 'i18n-ns');
      if (!found) found = getAttribute(el, 'data-i18n-ns');
      if (!found && el.parentElement) find(el.parentElement);
    }
    find(el);

    return found
}