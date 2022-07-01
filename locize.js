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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function isWindow(obj) {
    return obj != null && obj === obj.window;
  }
  function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }
  function offset(elem) {
    var box = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    var doc = elem && elem.ownerDocument;
    var docElem = doc && doc.documentElement;
    if (!docElem) return box;

    if (_typeof(elem.getBoundingClientRect) !== ( "undefined" )) {
      box = elem.getBoundingClientRect();
    }

    var win = getWindow(doc);
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
    if (e.srcElement && e.srcElement.nodeType === 1 && (e.srcElement.nodeName === 'BUTTON' || e.srcElement.nodeName === 'INPUT')) {
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
      var topBreaksAt; // eslint-disable-next-line no-plusplus

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
      // eslint-disable-next-line no-plusplus

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
    if (typeof str !== 'string') return; // eslint-disable-next-line consistent-return

    return str.replace(/\n +/g, '').trim();
  }

  function getAttribute(el, name) {
    return el && el.getAttribute && el.getAttribute(name);
  }

  function getElementI18nKey(el) {
    var key = getAttribute(el, 'data-i18n');
    if (key) return key;
    if (el.nodeType === window.Node.TEXT_NODE && el.parentElement) return getElementI18nKey(el.parentElement);
    return undefined;
  }
  function getElementNamespace(el) {
    var found;

    var find = function find(ele) {
      var opts = getAttribute(ele, 'i18next-options');
      if (!opts) opts = getAttribute(ele, 'data-i18next-options');
      if (!opts) opts = getAttribute(ele, 'i18n-options');
      if (!opts) opts = getAttribute(ele, 'data-i18n-options');

      if (opts) {
        var jsonData = {};

        try {
          jsonData = JSON.parse(opts);
        } catch (e) {// not our problem here in editor
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

  /* eslint-disable import/prefer-default-export */
  function createClickHandler(cb) {
    // eslint-disable-next-line consistent-return
    var handler = function handler(e) {
      var el = getClickedElement(e);
      if (!el) return {};
      e.preventDefault();
      e.stopPropagation();
      var text = getElementText(el);
      var key = getElementI18nKey(el);
      var rectEl = el.getBoundingClientRect ? el : el.parentElement;

      var _rectEl$getBoundingCl = rectEl.getBoundingClientRect(),
          top = _rectEl$getBoundingCl.top,
          left = _rectEl$getBoundingCl.left,
          width = _rectEl$getBoundingCl.width,
          height = _rectEl$getBoundingCl.height;

      var style = window.getComputedStyle(rectEl, null);
      var pT = parseFloat(style.getPropertyValue('padding-top'));
      var pB = parseFloat(style.getPropertyValue('padding-bottom'));
      var pR = parseFloat(style.getPropertyValue('padding-right'));
      var pL = parseFloat(style.getPropertyValue('padding-left'));
      var sizing = style.getPropertyValue('box-sizing');
      cb({
        tagName: rectEl.tagName,
        text: text,
        key: key,
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

  var baseBtn = 'font-family: "Helvetica", "Arial", sans-serif; font-size: 14px; color: #fff; border: none; font-weight: 300; height: 30px; line-height: 30px; padding: 0 15px; text-align: center; min-width: 90px; text-decoration: none; text-transform: uppercase; text-overflow: ellipsis; white-space: nowrap; outline: none; cursor: pointer; border-radius: 15px;';
  function initUI(options) {
    var cont = document.createElement('div');
    var style = 'font-family: "Helvetica", "Arial", sans-serif; bottom: 20px; right: 20px; padding: 10px; background-color: #fff; border: solid 1px #1976d2; box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.5); border-radius: 3px;';
    style += ' z-index: 2147483647; position: fixed;';
    cont.setAttribute('style', style);
    cont.setAttribute('ignorelocizeeditor', '');
    cont.setAttribute('translated', ''); //   if(options.locizeEditorToggle.containerClasses) {
    //     const classes = options.locizeEditorToggle.containerClasses.length > 1 ? options.locizeEditorToggle.containerClasses.split(' ') : options.locizeEditorToggle.containerClasses;
    //     classes.forEach(function(cssClass) {
    //       cont.classList.add(cssClass);
    //     });
    //   }

    var title = document.createElement('h4');
    title.id = 'locize-title';
    title.innerHTML = 'Translate InContext:';
    title.setAttribute('style', 'font-family: "Helvetica", "Arial", sans-serif; font-size: 14px; margin: 0 0 5px 0; color: #1976d2; font-weight: 300;');
    title.setAttribute('ignorelocizeeditor', '');
    cont.appendChild(title);
    var turnOn = document.createElement('button');
    turnOn.innerHTML = 'Open in locize';
    turnOn.setAttribute('style', "".concat(baseBtn, "  background-color: #1976d2;"));

    turnOn.onclick = function () {
      var i18next = options.getI18next();
      var backendOptions = i18next && i18next.options && i18next.options.backend;

      var _backendOptions$optio = _objectSpread2(_objectSpread2({}, backendOptions), options),
          projectId = _backendOptions$optio.projectId,
          version = _backendOptions$optio.version;

      window.location = "https://www.locize.app/cat/".concat(projectId, "/v/").concat(version, "/incontext?sourceurl=").concat(encodeURI(window.location.href));
    };

    turnOn.setAttribute('ignorelocizeeditor', '');
    cont.appendChild(turnOn);
    document.body.appendChild(cont);
  }

  var isInIframe = true;

  try {
    // eslint-disable-next-line no-undef, no-restricted-globals
    isInIframe = self !== top; // eslint-disable-next-line no-empty
  } catch (e) {}

  var source;
  var origin;
  var handler;
  var clickInterceptionEnabled;
  var handleLocizeSaved;
  var scriptTurnedOff; // used to flag turnOff by developers using the exported functions -> disable the editor function by code

  function addLocizeSavedHandler(hnd) {
    handleLocizeSaved = hnd;
  }
  var pendingMsgs = [];
  function onAddedKey(lng, ns, key, value) {
    var msg = {
      message: 'added',
      lng: lng,
      ns: ns,
      key: key,
      value: value
    };

    if (source) {
      source.postMessage(msg, origin);
    } else {
      pendingMsgs.push(msg);
    }
  }
  var i18next;
  var locizePlugin = {
    type: '3rdParty',
    init: function init(i18n) {
      i18next = i18n;
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

      if (isInIframe) {
        i18n.options.missingKeyHandler = function (lng, ns, k, val, isUpdate, opts) {
          if (!isUpdate) onAddedKey(lng, ns, k, val);
        };
      }
    }
  };

  function getI18next() {
    return i18next;
  }

  function showLocizeLink() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (!isInIframe) initUI(_objectSpread2(_objectSpread2({}, options), {}, {
      getI18next: getI18next
    }));
  }

  if (typeof window !== 'undefined') {
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
        pendingMsgs.forEach(function (m) {
          source.postMessage(m, e.origin);
        });
        pendingMsgs = [];
      } else if (e.data.message === 'turnOn') {
        if (scriptTurnedOff) return source.postMessage({
          message: 'forcedOff'
        }, origin);
        if (!clickInterceptionEnabled) window.document.body.addEventListener('click', handler, true);
        clickInterceptionEnabled = true;
        source.postMessage({
          message: 'turnedOn'
        }, origin);
      } else if (e.data.message === 'turnOff') {
        if (scriptTurnedOff) return source.postMessage({
          message: 'forcedOff'
        }, origin);
        if (clickInterceptionEnabled) window.document.body.removeEventListener('click', handler, true);
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
  }

  var turnOn = function turnOn() {
    scriptTurnedOff = false;
    if (!clickInterceptionEnabled) window.document.body.addEventListener('click', handler, true);
    clickInterceptionEnabled = true;
    if (source) source.postMessage({
      message: 'turnedOn'
    }, origin);
    return scriptTurnedOff;
  };
  var turnOff = function turnOff() {
    scriptTurnedOff = true;
    if (clickInterceptionEnabled) window.document.body.removeEventListener('click', handler, true);
    clickInterceptionEnabled = false;
    if (source) source.postMessage({
      message: 'turnedOff'
    }, origin);
    if (source) source.postMessage({
      message: 'forcedOff'
    }, origin);
    return scriptTurnedOff;
  };

  exports.addLocizeSavedHandler = addLocizeSavedHandler;
  exports.locizePlugin = locizePlugin;
  exports.onAddedKey = onAddedKey;
  exports.showLocizeLink = showLocizeLink;
  exports.turnOff = turnOff;
  exports.turnOn = turnOn;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
