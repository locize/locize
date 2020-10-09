(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locize = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function isWindow(obj) {
    return obj != null && obj === obj.window;
  }
  function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }
  function offset(elem) {
    var docElem,
        win,
        box = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
        doc = elem && elem.ownerDocument;
    docElem = doc && doc.documentElement;
    if (!docElem) return box;

    if (_typeof(elem.getBoundingClientRect) !== ( "undefined" )) {
      box = elem.getBoundingClientRect();
    }

    win = getWindow(doc);
    var top = box.top + win.pageYOffset - docElem.clientTop;
    var left = box.left + win.pageXOffset - docElem.clientLeft;
    return {
      top: top,
      left: left,
      right: left + (box.right - box.left),
      bottom: top + (box.bottom - box.top)
    };
  }
  function getClickedElement(e) {
    // clicked input
    if (e.srcElement && e.srcElement.nodeType === 1) {
      if (e.srcElement.getAttribute && e.srcElement.getAttribute('ignorelocizeeditor') === '') return null;
      return e.srcElement;
    }

    var el;

    if (e.originalEvent && e.originalEvent.explicitOriginalTarget) {
      el = e.originalEvent.explicitOriginalTarget;
    } else {
      var parent = e.srcElement;
      if (parent.getAttribute && parent.getAttribute('ignorelocizeeditor') === '') return null;
      var left = e.pageX;
      var top = e.pageY; // let pOffset = offset(parent);
      // console.warn('click', top, left);
      // console.warn('parent', parent, pOffset, parent.clientHeight, parent.offsetHeight);

      var topStartsAt = 0;
      var topBreaksAt;

      for (var i = 0; i < parent.childNodes.length; i++) {
        var n = parent.childNodes[i];
        var nOffset = offset(n); // console.warn('child', n, nOffset, n.clientHeight, n.offsetHeight)
        // if a node is with the bottom over the top click set the next child as start index

        if (n.nodeType === 1 && nOffset.bottom < top) topStartsAt = i + 1; // if node is below top click set end index to this node

        if (!topBreaksAt && nOffset.top + (n.clientHeight || 0) > top) topBreaksAt = i;
      } // check we are inside children lenght


      if (topStartsAt + 1 > parent.childNodes.length) topStartsAt = parent.childNodes.length - 1;
      if (!topBreaksAt) topBreaksAt = parent.childNodes.length; // console.warn('bound', topStartsAt, topBreaksAt)
      // inside our boundaries check when left is to big and out of clicks left

      for (var y = topStartsAt; y < topBreaksAt; y++) {
        var _n = parent.childNodes[y];

        var _nOffset = offset(_n);

        if ( _nOffset.left > left) {
          break;
        }

        if (_n && _n.nodeType !== 8) el = _n;
      }
    }

    return el;
  }
  function getElementText(el) {
    var str = el.textContent || el.text && el.text.innerText || el.placeholder;
    if (typeof str !== 'string') return;
    return str.replace(/\n +/g, '').trim();
  }

  function getAttribute(el, name) {
    return el && el.getAttribute && el.getAttribute(name);
  }

  function getElementNamespace(el) {
    var found;

    var find = function find(el) {
      var opts = getAttribute(el, 'i18next-options');
      if (!opts) opts = getAttribute(el, 'data-i18next-options');
      if (!opts) opts = getAttribute(el, 'i18n-options');
      if (!opts) opts = getAttribute(el, 'data-i18n-options');

      if (opts) {
        var jsonData = {};

        try {
          jsonData = JSON.parse(opts);
        } catch (e) {// not our problem here in editor
        }

        if (jsonData.ns) found = jsonData.ns;
      }

      if (!found) found = getAttribute(el, 'i18next-ns');
      if (!found) found = getAttribute(el, 'data-i18next-ns');
      if (!found) found = getAttribute(el, 'i18n-ns');
      if (!found) found = getAttribute(el, 'data-i18n-ns');
      if (!found && el.parentElement) find(el.parentElement);
    };

    find(el);
    return found;
  }

  /* eslint-disable import/prefer-default-export */
  function createClickHandler(cb) {
    var handler = function handler(e) {
      var el = getClickedElement(e);
      if (!el) return {};
      e.preventDefault();
      e.stopPropagation();
      var text = getElementText(el);

      var _el$getBoundingClient = el.getBoundingClientRect(),
          top = _el$getBoundingClient.top,
          left = _el$getBoundingClient.left,
          width = _el$getBoundingClient.width,
          height = _el$getBoundingClient.height;

      var style = window.getComputedStyle(el, null);
      var pT = parseFloat(style.getPropertyValue('padding-top'));
      var pB = parseFloat(style.getPropertyValue('padding-bottom'));
      var pR = parseFloat(style.getPropertyValue('padding-right'));
      var pL = parseFloat(style.getPropertyValue('padding-left'));
      var sizing = style.getPropertyValue('box-sizing');
      cb({
        tagName: el.tagName,
        text: text,
        ns: getElementNamespace(el),
        box: {
          top: top,
          left: left,
          width: sizing === 'border-box' ? width : width - pR - pL,
          height: sizing === 'border-box' ? height : height - pT - pB
        },
        style: style.cssText
      });
    };

    return handler;
  }

  var source;
  var origin;
  var handler;
  var clickInterceptionEnabled;
  var handleLocizeSaved;
  var locizePlugin = {
    type: '3rdParty',
    init: function init(i18n) {
      addLocizeSavedHandler(function (res) {
        res.updated.forEach(function (item) {
          var lng = item.lng,
              ns = item.ns,
              key = item.key,
              data = item.data;
          i18n.addResource(lng, ns, key, data.value, {
            silent: true
          });
          i18n.emit('editorSaved');
        });
      });

      i18n.options.missingKeyHandler = function (lng, ns, k, val, isUpdate, opts) {
        if (!isUpdate) onAddedKey(lng, ns, k, val);
      };
    }
  };
  function addLocizeSavedHandler(handler) {
    handleLocizeSaved = handler;
  }
  function onAddedKey(lng, ns, key, value) {
    if (source) source.postMessage({
      message: 'added',
      lng: lng,
      ns: ns,
      key: key,
      value: value
    }, origin);
  }

  if (!window.locizeBoundPostMessageAPI) {
    window.addEventListener('message', function (e) {
      if (e.data.message === 'isLocizeEnabled') {
        // console.warn("result: ", ev.data);
        // parent => ev.source;
        if (!source) {
          source = e.source;
          origin = e.origin;
          handler = createClickHandler(function (payload) {
            source.postMessage({
              message: 'clickedElement',
              payload: payload
            }, origin);
          }); // document.body.addEventListener('click', handler, true);
          // clickInterceptionEnabled = true;
        }

        source.postMessage({
          message: 'locizeIsEnabled',
          enabled: true
        }, e.origin);
      } else if (e.data.message === 'turnOn') {
        if (!clickInterceptionEnabled) document.body.addEventListener('click', handler, true);
        clickInterceptionEnabled = true;
        source.postMessage({
          message: 'turnedOn'
        }, origin);
      } else if (e.data.message === 'turnOff') {
        if (clickInterceptionEnabled) document.body.removeEventListener('click', handler, true);
        clickInterceptionEnabled = false;
        source.postMessage({
          message: 'turnedOff'
        }, origin);
      } else if (e.data.message === 'committed') {
        var data = e.data.payload;
        if (window.locizeSavedHandler) window.locizeSavedHandler(data);
        if (handleLocizeSaved) handleLocizeSaved(data);
      }
    });
    window.locizeBoundPostMessageAPI = true;
  }

  exports.addLocizeSavedHandler = addLocizeSavedHandler;
  exports.locizePlugin = locizePlugin;
  exports.onAddedKey = onAddedKey;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
