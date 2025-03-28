(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.locize = {}));
})(this, (function (exports) { 'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }

  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }

  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }

  var isBrowser = typeof window !== 'undefined';
  var INVISIBLE_CHARACTERS = isBrowser ? ["\u200C", "\u200D"] : ["\u200B", "\u200C"];
  var INVISIBLE_REGEX = RegExp("([".concat(INVISIBLE_CHARACTERS.join(''), "]{9})+"), 'gu');
  var TEMPLATE_MINIMUM_LENGTH = '{"k":"a"}'.length;
  var invisibleStartMarker = 'subliminal:start';
  var toBytes = function toBytes(text) {
    return Array.from(new TextEncoder().encode(text));
  };
  var fromBytes = function fromBytes(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
  var padToWholeBytes = function padToWholeBytes(binary) {
    var needsToAdd = 8 - binary.length;
    return '0'.repeat(needsToAdd) + binary;
  };
  var encodeMessage = function encodeMessage(text) {
    var bytes = toBytes(text).map(Number);
    var binary = bytes.map(function (byte) {
      return padToWholeBytes(byte.toString(2)) + '0';
    }).join('');
    var result = Array.from(binary).map(function (b) {
      return INVISIBLE_CHARACTERS[Number(b)];
    }).join('');
    return result;
  };
  var encodedInvisibleStartMarker = encodeMessage(invisibleStartMarker) ;
  var decodeMessage = function decodeMessage(message) {
    var binary = Array.from(message).map(function (character) {
      return INVISIBLE_CHARACTERS.indexOf(character);
    }).map(String).join('');
    var textBytes = binary.match(/(.{9})/g);
    var codes = Uint8Array.from((textBytes === null || textBytes === void 0 ? void 0 : textBytes.map(function (byte) {
      return parseInt(byte.slice(0, 8), 2);
    })) || []);
    return fromBytes(codes);
  };
  var decodeFromText = function decodeFromText(text) {
    var _text$match;
    var invisibleMessages = (_text$match = text.match(INVISIBLE_REGEX)) === null || _text$match === void 0 ? void 0 : _text$match.filter(function (m) {
      return m.length > TEMPLATE_MINIMUM_LENGTH - 1;
    });
    if (!invisibleMessages || invisibleMessages.length === 0) return;
    return decodeMessage(invisibleMessages[invisibleMessages.length - 1]);
  };
  var removeInvisibles = function removeInvisibles(text) {
    return text.replace(INVISIBLE_REGEX, '');
  };
  var encodeValue = function encodeValue(data) {
    if (Object.keys(data).length === 0) return data;
    var value = {
      k: data.key,
      n: data.ns,
      l: data.lng,
      s: data.source
    };
    return JSON.stringify(value);
  };
  var decodeValue = function decodeValue(value) {
    if (!value || typeof value !== 'string' || value.indexOf('{') !== 0) return;
    try {
      var parsed = JSON.parse(value || '{}');
      return {
        key: parsed.k,
        ns: parsed.n,
        lng: parsed.l,
        source: parsed.s
      };
    } catch (e) {
      return undefined;
    }
  };
  function wrap(text) {
    var invisibleMeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var encodedValue = encodeValue(invisibleMeta);
    var invisibleMark = encodeMessage(encodedValue);
    return typeof text === 'string' && text ? encodedInvisibleStartMarker + text + invisibleMark : text;
  }
  function unwrap(text) {
    var encodedValue = decodeFromText(text);
    var decodedVal = decodeValue(encodedValue);
    var result = removeInvisibles(text);
    return {
      text: result,
      invisibleMeta: decodedVal
    };
  }
  function containsHiddenMeta(text) {
    if (!text || text.length < 27) return false;
    if (!INVISIBLE_REGEX.test(text)) return false;
    var lastByte = text.substring(text.length - 9);
    var lastChar = decodeMessage(lastByte);
    return lastChar === '}';
  }
  function containsHiddenStartMarker(text) {
    return text.startsWith(encodedInvisibleStartMarker);
  }

  function ownKeys$7(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$7(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$7(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$7(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var postProcessorName = 'subliminal';
  var SubliminalPostProcessor = {
    name: postProcessorName,
    type: 'postProcessor',
    options: {},
    setOptions: function setOptions(options) {
      this.options = _objectSpread$7(_objectSpread$7({}, options), this.options);
    },
    process: function process(value, keyIn, options, translator) {
      var opt = this.options = _objectSpread$7(_objectSpread$7({}, options), this.options);
      var key, ns, lng, source;
      if (options.i18nResolved) {
        key = options.i18nResolved.exactUsedKey;
        ns = options.i18nResolved.usedNS;
        lng = options.i18nResolved.usedLng;
        if (options.i18nResolved.res === undefined) {
          if (key !== value) {
            source = 'default';
          } else {
            source = 'key';
          }
        } else {
          source = 'translation';
        }
      } else {
        var _ref, _opt$keySeparator, _translator$options, _ref2, _namespaces$, _translator$options2;
        var keySeparator = (_ref = (_opt$keySeparator = opt.keySeparator) !== null && _opt$keySeparator !== void 0 ? _opt$keySeparator : translator === null || translator === void 0 || (_translator$options = translator.options) === null || _translator$options === void 0 ? void 0 : _translator$options.keySeparator) !== null && _ref !== void 0 ? _ref : '.';
        var _translator$extractFr = translator.extractFromKey(keyIn.join(keySeparator), options),
          extractedKey = _translator$extractFr.key,
          namespaces = _translator$extractFr.namespaces;
        key = extractedKey;
        ns = (_ref2 = (_namespaces$ = namespaces === null || namespaces === void 0 ? void 0 : namespaces[0]) !== null && _namespaces$ !== void 0 ? _namespaces$ : opt.ns) !== null && _ref2 !== void 0 ? _ref2 : translator === null || translator === void 0 || (_translator$options2 = translator.options) === null || _translator$options2 === void 0 ? void 0 : _translator$options2.defaultNS;
        lng = options.lng || this.language;
        if (key === value) {
          source = 'key';
        } else {
          source = 'translation';
        }
      }
      return wrap(value, {
        key: key,
        ns: ns,
        lng: lng,
        source: source
      });
    },
    overloadTranslationOptionHandler: function overloadTranslationOptionHandler() {
      return {
        postProcess: postProcessorName,
        postProcessPassResolved: true
      };
    }
  };

  var validAttributes = ['placeholder', 'title', 'alt'];
  var ignoreElements = ['SCRIPT'];
  var colors = {
    highlight: '#1976d2',
    warning: '#e67a00',
    gray: '#ccc'
  };
  var getIframeUrl = function getIframeUrl() {
    var _prc$env;
    var p;
    if (typeof process !== 'undefined') p = process;
    if (!p && typeof window !== 'undefined') p = window.process;
    var prc = p || {};
    var env = ((_prc$env = prc.env) === null || _prc$env === void 0 ? void 0 : _prc$env.locizeIncontext) || 'production';
    return env === 'development' ? 'http://localhost:3003/' : env === 'staging' ? 'https://incontext-dev.locize.app' : 'https://incontext.locize.app';
  };

  var sheet = function () {
    if (typeof document === 'undefined') return;
    var style = document.createElement('style');
    document.head.appendChild(style);
    return style.sheet;
  }();

  function ownKeys$6(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$6(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$6(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$6(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var data$1 = {};
  function clean$1() {
    Object.values(data$1).forEach(function (item) {
      if (!document.body.contains(item.node)) {
        resetHighlight(item.id, item.node);
        delete data$1[item.id];
      }
    });
  }
  function save$1(id, type, node, txt) {
    if (!id || !type || !node) return;
    if (!data$1[id]) {
      data$1[id] = {
        id: id,
        node: node
      };
    }
    data$1[id].keys = _objectSpread$6(_objectSpread$6({}, data$1[id].keys), {}, _defineProperty({}, "".concat(type), {
      value: txt,
      eleUniqueID: id,
      textType: type
    }));
  }
  function remove(id, node) {
    resetHighlight(id, node);
    delete data$1[id];
  }
  function removeKey(id, key, node) {
    var item = get$1(id);
    if (!item) return;
    delete item.keys["".concat(key)];
    if (!Object.keys(item.keys).length) remove(id, node);
  }
  function get$1(id) {
    return data$1[id];
  }
  var uninstrumentedStore = {
    save: save$1,
    remove: remove,
    removeKey: removeKey,
    clean: clean$1,
    get: get$1,
    data: data$1
  };

  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }

  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  function getAttribute(el, name) {
    return el && el.getAttribute && el.getAttribute(name);
  }
  function getElementI18nKey(el) {
    var key = getAttribute(el, 'data-i18n');
    if (key) return key;
    if (el.nodeType === window.Node.TEXT_NODE && el.parentElement) {
      return getElementI18nKey(el.parentElement);
    }
    return undefined;
  }
  function parseAttrFromKey(key) {
    var attr = 'text';
    if (key.indexOf('[') === 0) {
      var parts = key.split(']');
      key = parts[1];
      attr = parts[0].substr(1, parts[0].length - 1);
    }
    var newKey = key.indexOf(';') === key.length - 1 ? key.substr(0, key.length - 2) : key;
    return [newKey, attr];
  }
  function getI18nMetaFromNode(el) {
    var hasNamespacePrependToKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var key = getElementI18nKey(el);
    var ns = getElementNamespace(el);
    var allKeys = {};
    if (key && key.indexOf(';') >= 0) {
      var keys = key.split(';');
      for (var ix = 0, lix = keys.length; ix < lix; ix++) {
        if (keys[ix] != '') {
          var _parseAttrFromKey = parseAttrFromKey(keys[ix]),
            _parseAttrFromKey2 = _slicedToArray(_parseAttrFromKey, 2),
            usedKey = _parseAttrFromKey2[0],
            attr = _parseAttrFromKey2[1];
          allKeys[attr] = usedKey;
        }
      }
    } else if (key) {
      var _parseAttrFromKey3 = parseAttrFromKey(key),
        _parseAttrFromKey4 = _slicedToArray(_parseAttrFromKey3, 2),
        _usedKey = _parseAttrFromKey4[0],
        _attr = _parseAttrFromKey4[1];
      allKeys[_attr] = _usedKey;
    }
    if (Object.keys(allKeys).length < 1) return null;
    var res = Object.keys(allKeys).reduce(function (mem, attr) {
      var key = allKeys[attr];
      var usedNS = ns;
      var usedKey = key;
      if (hasNamespacePrependToKey && key.indexOf(':') > -1) {
        var parts = key.split(':');
        usedKey = parts[1];
        usedNS = parts[0];
      }
      mem[attr] = {
        key: usedKey,
        ns: usedNS
      };
      return mem;
    }, {});
    return res;
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
        } catch (e) {}
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
  function getQsParameterByName(name, url) {
    if (typeof window === 'undefined') return null;
    if (!url) url = window.location.href.toLowerCase();
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  var _isInIframe = typeof window !== 'undefined';
  try {
    _isInIframe = self !== top;
  } catch (e) {}
  var isInIframe = _isInIframe;

  function ownKeys$5(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$5(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$5(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$5(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var legacyEventMapping = {
    committed: 'commitKeys'
  };
  function getMappedLegacyEvent(msg) {
    if (legacyEventMapping[msg]) return legacyEventMapping[msg];
    return msg;
  }
  function addLocizeSavedHandler(handler) {
    api.locizeSavedHandler = handler;
  }
  function setEditorLng(lng) {
    api.sendCurrentTargetLanguage(lng);
  }
  var pendingMsgs = [];
  var allowedActionsBeforeInit = ['locizeIsEnabled', 'requestInitialize'];
  function sendMessage(action, payload) {
    if (!api.source) {
      var _document$getElementB;
      api.source = (_document$getElementB = document.getElementById('i18next-editor-iframe')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.contentWindow;
    }
    if (!api.origin) api.origin = getIframeUrl();
    if (!api.source || !api.source.postMessage || !api.initialized && allowedActionsBeforeInit.indexOf(action) < 0) {
      pendingMsgs.push({
        action: action,
        payload: payload
      });
      return;
    }
    if (api.legacy) {
      api.source.postMessage(_objectSpread$5({
        message: action
      }, payload), api.origin);
    } else {
      api.source.postMessage({
        sender: 'i18next-editor',
        senderAPIVersion: 'v2',
        action: action,
        message: action,
        payload: payload
      }, api.origin);
    }
    var todo = pendingMsgs;
    pendingMsgs = [];
    todo.forEach(function (_ref) {
      var action = _ref.action,
        payload = _ref.payload;
      sendMessage(action, payload);
    });
  }
  var sendCurrentParsedContentDebounced = function sendCurrentParsedContentDebounced() {
    sendMessage('sendCurrentParsedContent', {
      content: Object.values(store.data).map(function (item) {
        return {
          id: item.id,
          keys: item.keys
        };
      }),
      uninstrumented: Object.values(uninstrumentedStore.data).map(function (item) {
        return {
          id: item.id,
          keys: item.keys
        };
      })
    });
  };
  var handlers = {};
  var repeat = 5;
  var api = {
    init: function init(implementation, clickHandler) {
      api.i18n = implementation;
      api.clickHandler = clickHandler;
    },
    requestInitialize: function requestInitialize(payload) {
      sendMessage('requestInitialize', payload);
      if (api.initInterval) return;
      api.initInterval = setInterval(function () {
        repeat = repeat - 1;
        api.requestInitialize(payload);
        if (repeat < 0 && api.initInterval) {
          clearInterval(api.initInterval);
          delete api.initInterval;
        }
      }, 2000);
    },
    selectKey: function selectKey(meta) {
      sendMessage('selectKey', meta);
    },
    confirmResourceBundle: function confirmResourceBundle(payload) {
      sendMessage('confirmResourceBundle', payload);
    },
    sendCurrentParsedContent: debounce(sendCurrentParsedContentDebounced, 500),
    sendCurrentTargetLanguage: function sendCurrentTargetLanguage(lng) {
      sendMessage('sendCurrentTargetLanguage', {
        targetLng: lng || api.i18n && api.i18n.getLng && api.i18n.getLng()
      });
    },
    sendHrefchanged: function sendHrefchanged(href) {
      sendMessage('hrefChanged', {
        href: href
      });
    },
    addHandler: function addHandler(action, fc) {
      if (!handlers[action]) handlers[action] = [];
      handlers[action].push(fc);
    },
    sendLocizeIsEnabled: function sendLocizeIsEnabled(payload) {
      sendMessage('locizeIsEnabled', _objectSpread$5(_objectSpread$5({}, payload), {}, {
        enabled: true
      }));
    },
    onAddedKey: function onAddedKey(lng, ns, key, value) {
      var msg = {
        lng: lng,
        ns: ns,
        key: key,
        value: value
      };
      sendMessage('added', msg);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('message', function (e) {
      var _e$data = e.data,
        sender = _e$data.sender,
        action = _e$data.action,
        message = _e$data.message,
        payload = _e$data.payload;
      if (message) {
        var usedEventName = getMappedLegacyEvent(message);
        if (handlers[usedEventName]) {
          handlers[usedEventName].forEach(function (fc) {
            fc(payload, e);
          });
        }
      } else if (sender === 'i18next-editor-frame' && handlers[action]) {
        handlers[action].forEach(function (fc) {
          fc(payload, e);
        });
      }
    });
  }

  function setValueOnNode(meta, value) {
    var item = store.get(meta.eleUniqueID);
    if (!item || !item.keys[meta.textType]) return;
    var txtWithHiddenMeta = item.subliminal ? wrap(value, item.subliminal) : value;
    if (meta.textType === 'text') {
      item.node.textContent = txtWithHiddenMeta;
    } else if (meta.textType.indexOf('attr:') === 0) {
      var attr = meta.textType.replace('attr:', '');
      item.node.setAttribute(attr, txtWithHiddenMeta);
    } else if (meta.textType === 'html') {
      var id = "".concat(meta.textType, "-").concat(meta.children);
      if (!item.originalChildNodes) {
        var clones = [];
        item.node.childNodes.forEach(function (c) {
          clones.push(c);
        });
        item.originalChildNodes = clones;
      }
      if (item.children[id].length === item.node.childNodes.length) {
        item.node.innerHTML = txtWithHiddenMeta;
      } else {
        var children = item.children[id];
        var first = children[0].child;
        var dummy = document.createElement('div');
        dummy.innerHTML = txtWithHiddenMeta;
        var nodes = [];
        dummy.childNodes.forEach(function (c) {
          nodes.push(c);
        });
        nodes.forEach(function (c) {
          try {
            item.node.insertBefore(c, first);
          } catch (error) {
            item.node.appendChild(c);
          }
        });
        children.forEach(function (replaceable) {
          if (item.node.contains(replaceable.child)) {
            item.node.removeChild(replaceable.child);
          }
        });
      }
    }
  }
  function handler$8(payload) {
    var meta = payload.meta,
      value = payload.value;
    if (meta && value !== undefined) {
      setValueOnNode(meta, value);
    }
  }
  api.addHandler('editKey', handler$8);

  function handler$7(payload) {
    var meta = payload.meta,
      value = payload.value,
      lng = payload.lng;
    if (meta && value !== undefined) {
      setValueOnNode(meta, value);
      var usedLng = lng || api.i18n.getLng();
      api.i18n.setResource(usedLng, meta.ns, meta.key, value);
      api.i18n.triggerRerender();
    }
  }
  api.addHandler('commitKey', handler$7);

  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }

  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }

  function handler$6(payload) {
    var updated = payload.updated;
    updated.forEach(function (item) {
      var lng = item.lng,
        ns = item.ns,
        key = item.key,
        data = item.data,
        metas = item.metas,
        meta = item.meta;
      if (meta && data.value) setValueOnNode(meta, data.value);
      if (metas) {
        Object.values(metas).forEach(function (metaItem) {
          setValueOnNode(metaItem, data.value);
        });
      }
      api.i18n.setResource(lng, ns, key, data.value);
      if (metas) {
        Object.values(metas).forEach(function (m) {
          var sItem = store.get(m.eleUniqueID);
          recalcSelectedHighlight(sItem, sItem.node, sItem.keys);
        });
      }
    });
    Object.values(store.data).forEach(function (item) {
      if (item.originalChildNodes) {
        var _item$node;
        (_item$node = item.node).replaceChildren.apply(_item$node, _toConsumableArray(item.originalChildNodes));
      }
    });
    api.i18n.triggerRerender();
    if (api.locizeSavedHandler) api.locizeSavedHandler(payload);
    if (window.locizeSavedHandler) window.locizeSavedHandler(payload);
  }
  api.addHandler('commitKeys', handler$6);

  function handler$5(payload) {
    api.initialized = true;
    clearInterval(api.initInterval);
    delete api.initInterval;
    api.sendCurrentParsedContent();
    api.sendCurrentTargetLanguage();
  }
  api.addHandler('confirmInitialized', handler$5);

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
    var horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
    return vertInView && horInView;
  }
  function mouseDistanceFromElement(mouseEvent, element) {
    var $n = element,
      mX = mouseEvent.pageX,
      mY = mouseEvent.pageY,
      from = {
        x: mX,
        y: mY
      },
      off = $n.getBoundingClientRect(),
      ny1 = off.top + document.documentElement.scrollTop,
      ny2 = ny1 + $n.offsetHeight,
      nx1 = off.left + document.documentElement.scrollLeft,
      nx2 = nx1 + $n.offsetWidth,
      maxX1 = Math.max(mX, nx1),
      minX2 = Math.min(mX, nx2),
      maxY1 = Math.max(mY, ny1),
      minY2 = Math.min(mY, ny2),
      intersectX = minX2 >= maxX1,
      intersectY = minY2 >= maxY1,
      to = {
        x: intersectX ? mX : nx2 < mX ? nx2 : nx1,
        y: intersectY ? mY : ny2 < mY ? ny2 : ny1
      },
      distX = to.x - from.x,
      distY = to.y - from.y,
      hypot = Math.pow(Math.pow(distX, 2) + Math.pow(distY, 2), 1 / 2);
    return Math.floor(hypot);
  }
  function getOptimizedBoundingRectEle(node) {
    var refEle = node;
    if (node.childNodes.length === 1) {
      var childNode = node.childNodes[0];
      if (childNode && childNode.nodeName === '#text') {
        var range = document.createRange();
        range.selectNode(childNode);
        var rect = range.getBoundingClientRect();
        refEle = {
          getBoundingClientRect: function getBoundingClientRect() {
            return rect;
          }
        };
      }
    }
    return refEle;
  }

  var debouncedUpdateDistance = debounce(function (e, observer) {
    Object.values(store.data).forEach(function (item) {
      if (!isInViewport(item.node)) return;
      var distance = mouseDistanceFromElement(e, item.node);
      if (distance < 5) {
        highlight(item, item.node, item.keys);
      } else if (distance > 5) {
        var boxDistance = item.ribbonBox ? mouseDistanceFromElement(e, item.ribbonBox) : 1000;
        if (boxDistance > 10) resetHighlight(item, item.node, item.keys);
      }
    });
    Object.values(uninstrumentedStore.data).forEach(function (item) {
      if (!isInViewport(item.node)) return;
      var distance = mouseDistanceFromElement(e, item.node);
      if (distance < 10) {
        highlightUninstrumented(item, item.node, item.keys);
      } else if (distance > 10) {
        resetHighlight(item, item.node, item.keys);
      }
    });
  }, 50);
  var currentFC;
  function startMouseTracking(observer) {
    currentFC = function handle(e) {
      debouncedUpdateDistance(e, observer);
    };
    document.addEventListener('mousemove', currentFC);
  }
  function stopMouseTracking() {
    document.removeEventListener('mousemove', currentFC);
  }

  var iconEdit = '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="#FFFFFF"><g></g><g><g><g><path d="M3,21l3.75,0L17.81,9.94l-3.75-3.75L3,17.25L3,21z M5,18.08l9.06-9.06l0.92,0.92L5.92,19L5,19L5,18.08z"/></g><g><path d="M18.37,3.29c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83l3.75,3.75l1.83-1.83c0.39-0.39,0.39-1.02,0-1.41L18.37,3.29z"/></g></g></g></svg>';
  var i18nextIcon = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 210 304\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"#fff\" fill-rule=\"evenodd\">\n  <g stroke=\"none\" class=\"B\">\n    <path d=\"M 142 31.5 v 57.2 l 64.3 165.1 s 19.6 40.3 -36.5 50.1 h -128 s -52.3 -5.5 -39.8 -46.9 L 69.5 88.7 V 31.5 z\" fill=\"#009688\"/>\n    <path d=\"M 143.3 24.8 H 66.2 c -6.2 0 -11.3 -5.6 -11.3 -12.4 S 60 0 66.2 0 h 77.1 c 6.3 0 11.3 5.6 11.3 12.4 s -5.1 12.4 -11.3 12.4 z\" class=\"C\" fill=\"#004d40\"/>\n    <path d=\"M 123 124.9 c 8.3 0 15 8.1 15 18.1 c 0 10 -6.8 18.1 -15 18.1 c -8.3 0 -15 -8.1 -15 -18.1 c 0 -10 6.7 -18.1 15 -18.1 z m -58.8 31.7 c 0 -8.5 5.6 -15.3 12.7 -15.3 s 12.7 6.8 12.7 15.3 s -5.6 15.3 -12.7 15.3 s -12.7 -6.8 -12.7 -15.3 z\" fill=\"white\"/>\n    <path d=\"M 147.7 84.9 V 57.7 s 34.5 -7.6 51.7 32.5 c 0 0 -26.9 19.6 -51.7 -5.3 z m -84.5 0 V 57.7 s -34.5 -7.6 -51.7 32.5 c 0 0 26.8 19.6 51.7 -5.3 z\" class=\"C\" fill=\"#004d40\"/>\n    <path d=\"M 168.4 197.5 c -56.1 -17.4 -103.3 -8.1 -126.3 -1 l -23.2 56 c -10.5 33.4 33.2 37.8 33.2 37.8 h 106.9 c 46.9 -7.9 30.5 -40.4 30.5 -40.4 z\" fill=\"white\"/>\n    <path d=\"M 87.6 218.3 c 0 6 -8.1 10.9 -18.1 10.9 s -18.1 -4.9 -18.1 -10.9 c 0 -6.1 8.1 -10.9 18.1 -10.9 s 18.1 4.9 18.1 10.9 z m 64.4 0 c 0 6 -8.1 10.9 -18.1 10.9 c -10 0 -18.1 -4.9 -18.1 -10.9 c 0 -6.1 8.1 -10.9 18.1 -10.9 c 10 0 18.1 4.9 18.1 10.9 z\" class=\"C\" fill=\"#004d40\"/>\n  </g>\n</svg>\n";
  var locizeIcon = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 194.667 196\" height=\"196\" width=\"194.667\" xml:space=\"preserve\">\n  <defs>\n    <clipPath id=\"a\" clipPathUnits=\"userSpaceOnUse\">\n      <path d=\"M5.5 74.048C5.5 36.98 35.551 6.93 72.619 6.93c37.069 0 67.119 30.05 67.119 67.118 0 37.07-30.05 67.12-67.119 67.12-37.068 0-67.119-30.05-67.119-67.12\"/>\n    </clipPath>\n    <clipPath id=\"b\" clipPathUnits=\"userSpaceOnUse\">\n      <path d=\"M0 147h146V0H0Z\"/>\n    </clipPath>\n    <clipPath id=\"c\" clipPathUnits=\"userSpaceOnUse\">\n      <path d=\"M88.756 55.055h50.982l4.512 88.195-64 1.25z\"/>\n    </clipPath>\n  </defs>\n  <g clip-path=\"url(#a)\" transform=\"matrix(1.33333 0 0 -1.33333 0 196)\">\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-.766-5.554 1.148-8.427 0-11.107-1.149-2.681-2.49-7.469-1.341-10.724 1.149-3.255 2.872-10.34 4.404-10.533 1.532-.19-1.148 7.66.383 5.171 1.533-2.49 1.533-6.193 4.214-8.746 2.68-2.553 6.319-2.17 9.192-4.658 2.872-2.49 5.744-6.129 8.425-5.746 0 0-.192-1.914-1.532-5.17-1.34-3.255-1.532-7.084.192-9.383 1.723-2.298 3.446-5.746 4.979-7.469 1.532-1.723 2.681-10.915 2.297-15.51-.382-4.596 1.724-14.937 6.511-17.236 4.787-2.298 0 1.15-.957 4.022-.958 2.872.739 9.575 3.052 10.533 2.309.958 4.416 4.787 6.139 7.469 1.724 2.68 6.128 3.83 7.469 7.084 1.341 3.255.766 7.085 1.532 8.809.766 1.724 2.873 5.554-1.724 7.852-4.595 2.298-6.51 1.148-6.702 3.255-.192 2.107-1.341 4.404-4.595 5.361-3.256.959-6.129 2.816-9.768 3.227-3.638.412-4.404-2.461-6.319-.928-1.914 1.531-3.446 3.064-4.213 4.978-.765 1.915-3.064.766-2.871 1.915.19 1.15 3.254 4.404-.193 3.255-3.446-1.148-6.51-.765-6.319 2.298.193 3.064 4.405 4.214 6.129 4.597 1.722.383 3.063-1.723 5.17-3.065 2.106-1.34.191 1.915 1.34 4.214 1.149 2.298 5.554 2.106 6.128 5.361.575 3.255-.191 5.937 3.256 6.32 3.446.383 7.084-.191 7.468 1.533.382 1.722-4.022-.576-4.213 1.531-.192 2.106 3.829 4.978 4.978 2.872 1.149-2.106 4.022-2.298 4.405-1.531.383.765 0 2.105-1.341 5.361-1.34 3.256-2.681 2.298-3.829 5.936-1.149 3.639-3.064-.191-4.979 1.724s-4.213 5.937-4.597 2.489c-.382-3.446-.382-5.361-2.105-8.042-1.724-2.682-2.489-.575-4.022 1.149-1.532 1.723-4.979 3.447-3.83 4.978C23.362 4.979 24.511 9 26.234 7.85c1.724-1.149 4.405-1.149 4.022.767-.383 1.914 0 2.681.766 3.638.766.958 3.447 2.682 3.447-.766 0-3.447-.384-4.405 2.298-4.788 2.681-.383 5.744-.574 5.554 1.149-.193 1.724.766 1.341 0 4.214-.767 2.873-3.065 3.063-5.554 4.405-2.489 1.34-3.83 3.446-5.936 2.68s-2.299-1.531-2.49-3.638c-.192-2.107-1.341-2.873-2.107-1.915-.765.957.192 4.022-2.68 2.106-2.873-1.914-4.021-5.171-5.553-2.872-1.533 2.297 2.297 6.319-1.724 4.595-4.022-1.723-6.895-3.637-4.788-4.404 2.107-.766 4.214-2.107 2.107-2.873-2.107-.765-6.32.575-7.852-.957C4.212 7.66 0 0 0 0\" transform=\"translate(13.926 109.38)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-.766-5.554 1.148-8.427 0-11.107-1.149-2.681-2.49-7.469-1.341-10.724 1.149-3.255 2.872-10.34 4.404-10.533 1.532-.19-1.148 7.66.383 5.171 1.533-2.49 1.533-6.193 4.214-8.746 2.68-2.553 6.319-2.17 9.192-4.658 2.872-2.49 5.744-6.129 8.425-5.746 0 0-.192-1.914-1.532-5.17-1.34-3.255-1.532-7.084.192-9.383 1.723-2.298 3.446-5.746 4.979-7.469 1.532-1.723 2.681-10.915 2.297-15.51-.382-4.596 1.724-14.937 6.511-17.236 4.787-2.298 0 1.15-.957 4.022-.958 2.872.739 9.575 3.052 10.533 2.309.958 4.416 4.787 6.139 7.469 1.724 2.68 6.128 3.83 7.469 7.084 1.341 3.255.766 7.085 1.532 8.809.766 1.724 2.873 5.554-1.724 7.852-4.595 2.298-6.51 1.148-6.702 3.255-.192 2.107-1.341 4.404-4.595 5.361-3.256.959-6.129 2.816-9.768 3.227-3.638.412-4.404-2.461-6.319-.928-1.914 1.531-3.446 3.064-4.213 4.978-.765 1.915-3.064.766-2.871 1.915.19 1.15 3.254 4.404-.193 3.255-3.446-1.148-6.51-.765-6.319 2.298.193 3.064 4.405 4.214 6.129 4.597 1.722.383 3.063-1.723 5.17-3.065 2.106-1.34.191 1.915 1.34 4.214 1.149 2.298 5.554 2.106 6.128 5.361.575 3.255-.191 5.937 3.256 6.32 3.446.383 7.084-.191 7.468 1.533.382 1.722-4.022-.576-4.213 1.531-.192 2.106 3.829 4.978 4.978 2.872 1.149-2.106 4.022-2.298 4.405-1.531.383.765 0 2.105-1.341 5.361-1.34 3.256-2.681 2.298-3.829 5.936-1.149 3.639-3.064-.191-4.979 1.724s-4.213 5.937-4.597 2.489c-.382-3.446-.382-5.361-2.105-8.042-1.724-2.682-2.489-.575-4.022 1.149-1.532 1.723-4.979 3.447-3.83 4.978C23.362 4.979 24.511 9 26.234 7.85c1.724-1.149 4.405-1.149 4.022.767-.383 1.914 0 2.681.766 3.638.766.958 3.447 2.682 3.447-.766 0-3.447-.384-4.405 2.298-4.788 2.681-.383 5.744-.574 5.554 1.149-.193 1.724.766 1.341 0 4.214-.767 2.873-3.065 3.063-5.554 4.405-2.489 1.34-3.83 3.446-5.936 2.68s-2.299-1.531-2.49-3.638c-.192-2.107-1.341-2.873-2.107-1.915-.765.957.192 4.022-2.68 2.106-2.873-1.914-4.021-5.171-5.553-2.872-1.533 2.297 2.297 6.319-1.724 4.595-4.022-1.723-6.895-3.637-4.788-4.404 2.107-.766 4.214-2.107 2.107-2.873-2.107-.765-6.32.575-7.852-.957C4.212 7.66 0 0 0 0Z\" transform=\"translate(13.926 109.38)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-.01-2.141.575-3.829 2.49-1.915C4.405 0 5.553 2.298 6.895 1.341c1.34-.958 3.638-.703 4.594-.639.959.064 1.15 2.937 3.831 2.554s1.724.574 4.596 2.107c2.873 1.532 9.001 4.212 2.681 3.446-6.32-.766-6.703.958-11.108-1.914-4.403-2.873-5.36-2.873-6.509-3.639-1.149-.766-2.49 2.298-4.022 0C-.575.958.011 2.182 0 0\" transform=\"translate(36.522 130.061)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-.01-2.141.575-3.829 2.49-1.915C4.405 0 5.553 2.298 6.895 1.341c1.34-.958 3.638-.703 4.594-.639.959.064 1.15 2.937 3.831 2.554s1.724.574 4.596 2.107c2.873 1.532 9.001 4.212 2.681 3.446-6.32-.766-6.703.958-11.108-1.914-4.403-2.873-5.36-2.873-6.509-3.639-1.149-.766-2.49 2.298-4.022 0C-.575.958.011 2.182 0 0Z\" transform=\"translate(36.522 130.061)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-2.263-1.956-5.744-4.788-3.064-4.788 2.681 0 3.983 1.404 5.439-.447 1.456-1.85.88-4.723.88-6.063 0-1.341-.766-4.406 1.15-8.235 1.915-3.829 2.106-6.319 4.022-3.829 1.914 2.488 6.51 7.276 8.808 7.658 2.298.384 4.597 1.342 5.746 3.257 1.148 1.915 0 3.773 1.914 5.141 1.914 1.369 1.531 3.093 2.107 5.199C27.575 0 32.747 0 30.448 1.148c-2.297 1.15-6.51 1.916-11.49 1.341C13.979 1.915 4.213 3.638 0 0\" transform=\"translate(59.502 135.998)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-2.263-1.956-5.744-4.788-3.064-4.788 2.681 0 3.983 1.404 5.439-.447 1.456-1.85.88-4.723.88-6.063 0-1.341-.766-4.406 1.15-8.235 1.915-3.829 2.106-6.319 4.022-3.829 1.914 2.488 6.51 7.276 8.808 7.658 2.298.384 4.597 1.342 5.746 3.257 1.148 1.915 0 3.773 1.914 5.141 1.914 1.369 1.531 3.093 2.107 5.199C27.575 0 32.747 0 30.448 1.148c-2.297 1.15-6.51 1.916-11.49 1.341C13.979 1.915 4.213 3.638 0 0Z\" transform=\"translate(59.502 135.998)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-1.218-1.986-.575-2.107.766-2.49 1.34-.383-.575-2.68.957-2.872 1.532-.193 4.979-1.15 5.936 0 .959 1.148-1.531.7-3.255 1.977C2.682-2.107.865 1.41 0 0\" transform=\"translate(38.438 76.826)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-1.218-1.986-.575-2.107.766-2.49 1.34-.383-.575-2.68.957-2.872 1.532-.193 4.979-1.15 5.936 0 .959 1.148-1.531.7-3.255 1.977C2.682-2.107.865 1.41 0 0Z\" transform=\"translate(38.438 76.826)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-2.063-1.033-1.148-2.682-3.064-3.831-1.915-1.148-1.149-1.531-1.723-4.213-.575-2.68.191-4.212 1.532-2.106S2.298 1.148 0 0\" transform=\"translate(131.121 45.612)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-2.063-1.033-1.148-2.682-3.064-3.831-1.915-1.148-1.149-1.531-1.723-4.213-.575-2.68.191-4.212 1.532-2.106S2.298 1.148 0 0Z\" transform=\"translate(131.121 45.612)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-.575-.575-1.532 2.681-2.106 4.213-.575 1.532-.561 4.195 1.056 5.675C.964 11.734 0 7.469 0 5.17 0 2.873.574.575 0 0m-6.704 5.936c-1.341.766-3.828 0-6.892-.957-3.065-.958-.613 2.131.766 4.213 1.233 1.861.574-.574 3.256-.766 2.68-.192 4.213-3.256 2.87-2.49m-4.402-6.511c-.192-1.531.574-4.021-3.639-3.064-4.213.958-4.213 3.256-5.936 1.533-1.723-1.724-3.83-3.255-6.32-.575C-29.49 0-29.107.766-30.447.958c-.955.135-4.138.846-6.792.074.206.123.426.285.663.5 1.915 1.723 1.532 2.298 3.638 4.213 2.108 1.916 3.639 3.638 5.171 1.916 1.532-1.725 4.788-2.108 3.639-4.023-1.149-1.914-.383-3.063.958-1.914 1.339 1.149 3.255 1.914 1.915 3.446-1.342 1.532-2.682 5.554-.766 2.873 1.915-2.681 2.489-4.022 3.637-5.553C-17.234.958-16.085 0-15.702.958c.383.957-.192 3.063.383 3.446.574.383 0-3.255 1.723-3.446 1.723-.192 2.681 0 2.49-1.533M9.192-8.81c-.574 3.257-4.787 32.747-4.787 32.747s-11.299 7.277-13.213 5.746c-1.916-1.533-5.171-1.302-4.788.21s2.872 1.128-1.341 4.002c-4.212 2.873-4.978 5.362-8.233 1.724-3.257-3.639-4.022-6.703-5.937-7.661-1.915-.957-3.447-4.021-1.34-4.787 2.106-.765 2.298 0 4.02-1.531 1.725-1.533 4.023-1.149 4.406-.193.383.959.766 4.022.957 5.171.192 1.149 2.138 4.979 1.93 1.915-.207-3.064 2.665-3.064.75-5.17-1.914-2.106-.765-3.831-4.595-4.214-3.831-.382-4.022 1.915-6.128.766-2.107-1.148-1.915-1.915-2.681-3.063-.766-1.149-4.788-3.447-4.788-3.447s-3.255 1.149-1.724-.958c1.533-2.106 2.873-4.595 1.533-4.786-1.341-.192-4.98 1.914-4.98-.384s-.573-4.787.959-5.362c1.081-.405 1.783-1.284 2.775-1.161-.769-.332-1.468-.813-2.009-1.52-1.491-1.947-.575-5.362-3.639-6.511-3.063-1.15-3.063-2.489-3.639-4.979-.573-2.489 0-8.808.766-9.383.765-.574 2.107-5.362 5.363-4.978 3.256.383 6.702.53 7.851-.023 1.149-.551 3.063 1.171 3.638-3.233.575-4.404 1.915-4.979 2.681-7.277.766-2.297-.383-7.086 0-9.958s3.064-7.852 3.064-10.341c0-2.489 2.873-3.638 4.405-2.681 1.532.958 4.787 2.873 6.127 5.937 1.342 3.063 1.342 4.595 3.447 8.617 2.106 4.021 1.533 6.894 2.489 9.958.958 3.064 3.262 5.171 6.419 8.617 3.156 3.446 2.588 5.362 0 5.171-2.588-.191-4.314 2.297-5.654 5.361-1.338 3.065-2.87 10.724-1.721 8.235 1.149-2.491 3.446-9.384 5.744-10.533 2.298-1.149 6.512 1.953 7.469 3.083.957 1.131.574 4.385-1.916 5.726C.383-8.617 1.915-7.469 4.405-9c2.489-1.532 5.362-3.064 4.787.19\" transform=\"translate(132.845 86.592)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-.575-.575-1.532 2.681-2.106 4.213-.575 1.532-.561 4.195 1.056 5.675C.964 11.734 0 7.469 0 5.17 0 2.873.574.575 0 0Zm-6.704 5.936c-1.341.766-3.828 0-6.892-.957-3.065-.958-.613 2.131.766 4.213 1.233 1.861.574-.574 3.256-.766 2.68-.192 4.213-3.256 2.87-2.49zm-4.402-6.511c-.192-1.531.574-4.021-3.639-3.064-4.213.958-4.213 3.256-5.936 1.533-1.723-1.724-3.83-3.255-6.32-.575C-29.49 0-29.107.766-30.447.958c-.955.135-4.138.846-6.792.074.206.123.426.285.663.5 1.915 1.723 1.532 2.298 3.638 4.213 2.108 1.916 3.639 3.638 5.171 1.916 1.532-1.725 4.788-2.108 3.639-4.023-1.149-1.914-.383-3.063.958-1.914 1.339 1.149 3.255 1.914 1.915 3.446-1.342 1.532-2.682 5.554-.766 2.873 1.915-2.681 2.489-4.022 3.637-5.553C-17.234.958-16.085 0-15.702.958c.383.957-.192 3.063.383 3.446.574.383 0-3.255 1.723-3.446 1.723-.192 2.681 0 2.49-1.533zM9.192-8.81c-.574 3.257-4.787 32.747-4.787 32.747s-11.299 7.277-13.213 5.746c-1.916-1.533-5.171-1.302-4.788.21s2.872 1.128-1.341 4.002c-4.212 2.873-4.978 5.362-8.233 1.724-3.257-3.639-4.022-6.703-5.937-7.661-1.915-.957-3.447-4.021-1.34-4.787 2.106-.765 2.298 0 4.02-1.531 1.725-1.533 4.023-1.149 4.406-.193.383.959.766 4.022.957 5.171.192 1.149 2.138 4.979 1.93 1.915-.207-3.064 2.665-3.064.75-5.17-1.914-2.106-.765-3.831-4.595-4.214-3.831-.382-4.022 1.915-6.128.766-2.107-1.148-1.915-1.915-2.681-3.063-.766-1.149-4.788-3.447-4.788-3.447s-3.255 1.149-1.724-.958c1.533-2.106 2.873-4.595 1.533-4.786-1.341-.192-4.98 1.914-4.98-.384s-.573-4.787.959-5.362c1.081-.405 1.783-1.284 2.775-1.161-.769-.332-1.468-.813-2.009-1.52-1.491-1.947-.575-5.362-3.639-6.511-3.063-1.15-3.063-2.489-3.639-4.979-.573-2.489 0-8.808.766-9.383.765-.574 2.107-5.362 5.363-4.978 3.256.383 6.702.53 7.851-.023 1.149-.551 3.063 1.171 3.638-3.233.575-4.404 1.915-4.979 2.681-7.277.766-2.297-.383-7.086 0-9.958s3.064-7.852 3.064-10.341c0-2.489 2.873-3.638 4.405-2.681 1.532.958 4.787 2.873 6.127 5.937 1.342 3.063 1.342 4.595 3.447 8.617 2.106 4.021 1.533 6.894 2.489 9.958.958 3.064 3.262 5.171 6.419 8.617 3.156 3.446 2.588 5.362 0 5.171-2.588-.191-4.314 2.297-5.654 5.361-1.338 3.065-2.87 10.724-1.721 8.235 1.149-2.491 3.446-9.384 5.744-10.533 2.298-1.149 6.512 1.953 7.469 3.083.957 1.131.574 4.385-1.916 5.726C.383-8.617 1.915-7.469 4.405-9c2.489-1.532 5.362-3.064 4.787.19z\" transform=\"translate(132.845 86.592)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-1.173-.353-2.106-2.681-1.532-3.831.576-1.148-.574.576-2.106-.382-1.533-.957-3.808-3.639-1.713-3.829 2.096-.193 1.713 1.531 3.628.765 1.915-.765 4.021-.575 4.021 1.34C2.298-4.021 1.915.574 0 0\" transform=\"translate(95.886 109.955)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-1.173-.353-2.106-2.681-1.532-3.831.576-1.148-.574.576-2.106-.382-1.533-.957-3.808-3.639-1.713-3.829 2.096-.193 1.713 1.531 3.628.765 1.915-.765 4.021-.575 4.021 1.34C2.298-4.021 1.915.574 0 0Z\" transform=\"translate(95.886 109.955)\"/>\n    <path style=\"fill:#2196f3;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-1.154-.165-1.533-3.064.957-3.447 2.49-.383 6.947.575 5.293 2.107C4.596.191 2.682.383 0 0\" transform=\"translate(83.44 118.763)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-1.154-.165-1.533-3.064.957-3.447 2.49-.383 6.947.575 5.293 2.107C4.596.191 2.682.383 0 0Z\" transform=\"translate(83.44 118.763)\"/>\n  </g>\n  <g clip-path=\"url(#b)\" transform=\"matrix(1.33333 0 0 -1.33333 0 196)\">\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c0-37.068-30.05-67.119-67.119-67.119S-134.238-37.068-134.238 0c0 37.069 30.05 67.119 67.119 67.119S0 37.069 0 0Z\" transform=\"translate(139.738 74.049)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:8;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c0-36.731-29.777-66.509-66.509-66.509S-133.019-36.731-133.019 0c0 36.733 29.778 66.51 66.51 66.51C-29.777 66.51 0 36.733 0 0Z\" transform=\"translate(139.438 73.186)\"/>\n  </g>\n  <g clip-path=\"url(#c)\" transform=\"matrix(1.33333 0 0 -1.33333 0 196)\">\n    <path style=\"fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-1.542-1.541-3.386-2.311-5.533-2.311-2.148 0-3.991.77-5.532 2.311s-2.313 3.387-2.313 5.533c0 2.147.772 3.963 2.313 5.45 1.541 1.486 3.384 2.23 5.532 2.23 2.147 0 3.991-.744 5.533-2.23 1.54-1.487 2.312-3.303 2.312-5.45C2.312 3.387 1.54 1.541 0 0m12.551 23.039c-4.954 4.9-10.954 7.35-18.001 7.35-7.047 0-13.047-2.45-18.002-7.35-4.955-4.898-7.432-10.817-7.432-17.754 0-4.183 2.119-11.176 6.359-20.974 4.238-9.799 8.477-18.717 12.715-26.754 4.241-8.037 6.36-11.946 6.36-11.727.66 1.211 1.568 2.863 2.724 4.955 1.157 2.092 3.194 6.029 6.112 11.809 2.917 5.781 5.477 11.094 7.678 15.935a203.312 203.312 0 0 1 6.111 15.032c1.873 5.173 2.807 9.082 2.807 11.724 0 6.937-2.477 12.856-7.431 17.754\" transform=\"translate(119.64 109.307)\"/>\n    <path style=\"fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none\" d=\"M0 0c-1.542-1.541-3.386-2.311-5.533-2.311-2.148 0-3.991.77-5.532 2.311s-2.313 3.387-2.313 5.533c0 2.147.772 3.963 2.313 5.45 1.541 1.486 3.384 2.23 5.532 2.23 2.147 0 3.991-.744 5.533-2.23 1.54-1.487 2.312-3.303 2.312-5.45C2.312 3.387 1.54 1.541 0 0m12.551 23.039c-4.954 4.9-10.954 7.35-18.001 7.35-7.047 0-13.047-2.45-18.002-7.35-4.955-4.898-7.432-10.817-7.432-17.754 0-4.183 2.119-11.176 6.359-20.974 4.238-9.799 8.477-18.717 12.715-26.754 4.241-8.037 6.36-11.946 6.36-11.727.66 1.211 1.568 2.863 2.724 4.955 1.157 2.092 3.194 6.029 6.112 11.809 2.917 5.781 5.477 11.094 7.678 15.935a203.312 203.312 0 0 1 6.111 15.032c1.873 5.173 2.807 9.082 2.807 11.724 0 6.937-2.477 12.856-7.431 17.754\" transform=\"translate(119.64 109.307)\"/>\n    <path style=\"fill:none;stroke:#2196f3;stroke-width:5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1\" d=\"M0 0c-1.542-1.541-3.386-2.311-5.533-2.311-2.148 0-3.991.77-5.532 2.311s-2.313 3.387-2.313 5.533c0 2.147.772 3.963 2.313 5.45 1.541 1.486 3.384 2.23 5.532 2.23 2.147 0 3.991-.744 5.533-2.23 1.54-1.487 2.312-3.303 2.312-5.45C2.312 3.387 1.54 1.541 0 0Zm12.551 23.039c-4.954 4.9-10.954 7.35-18.001 7.35-7.047 0-13.047-2.45-18.002-7.35-4.955-4.898-7.432-10.817-7.432-17.754 0-4.183 2.119-11.176 6.359-20.974 4.238-9.799 8.477-18.717 12.715-26.754 4.241-8.037 6.36-11.946 6.36-11.727.66 1.211 1.568 2.863 2.724 4.955 1.157 2.092 3.194 6.029 6.112 11.809 2.917 5.781 5.477 11.094 7.678 15.935a203.312 203.312 0 0 1 6.111 15.032c1.873 5.173 2.807 9.082 2.807 11.724 0 6.937-2.477 12.856-7.431 17.754z\" transform=\"translate(119.64 109.307)\"/>\n  </g>\n</svg>\n";
  var minimizeIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h12v2H6v-2z"/></svg>';
  var editIconUrl = URL.createObjectURL(new Blob([iconEdit], {
    type: 'image/svg+xml'
  }));
  URL.createObjectURL(new Blob([i18nextIcon], {
    type: 'image/svg+xml'
  }));
  var minimizeIconUrl = URL.createObjectURL(new Blob([minimizeIcon], {
    type: 'image/svg+xml'
  }));
  var locizeIconUrl = URL.createObjectURL(new Blob([locizeIcon], {
    type: 'image/svg+xml'
  }));
  function EditIcon() {
    var image = document.createElement('img');
    image.setAttribute('data-i18next-editor-element', 'true');
    image.src = editIconUrl;
    image.style.width = '15px';
    return image;
  }

  if (sheet) {
    sheet.insertRule("@keyframes i18next-editor-animate-top { \n      from {\n        top: calc(100vh + 600px); \n        left: calc(100vw + 300px);\n        opacity: 0;\n      }\n      to {\n        top: var(--i18next-editor-popup-position-top);\n        left: var(--i18next-editor-popup-position-left);\n        opacity: 1;\n      }\n    }");
    sheet.insertRule("@keyframes i18next-editor-animate-bottom { \n      from {\n        top: var(--i18next-editor-popup-position-top);\n        left: var(--i18next-editor-popup-position-left);\n        opacity: 1;\n      }\n      to {\n        top: calc(100vh + 600px); \n        left: calc(100vw + 300px);\n        opacity: 0;\n      }\n    }");
    sheet.insertRule(".i18next-editor-popup * { \n      -webkit-touch-callout: none; /* iOS Safari */\n      -webkit-user-select: none; /* Safari */\n      -khtml-user-select: none; /* Konqueror HTML */\n      -moz-user-select: none; /* Firefox */\n      -ms-user-select: none; /* Internet Explorer/Edge */\n      user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */\n    }");
    sheet.insertRule(".i18next-editor-popup .resizer-right {\n      width: 15px;\n      height: 100%;\n      background: transparent;\n      position: absolute;\n      right: -15px;\n      bottom: 0;\n      cursor: e-resize;\n    }");
    sheet.insertRule(".i18next-editor-popup .resizer-both {\n      width: 15px;\n      height: 15px;\n      background: transparent;\n      z-index: 10;\n      position: absolute;\n      right: -15px;\n      bottom: -15px;\n      cursor: se-resize;\n    }");
    sheet.insertRule(".i18next-editor-popup .resizer-bottom {\n      width: 100%;\n      height: 15px;\n      background: transparent;\n      position: absolute;\n      right: 0;\n      bottom: -15px;\n      cursor: s-resize;\n    }");
  }
  function Ribbon(popupEle, onMaximize) {
    var ribbon = document.createElement('div');
    ribbon.setAttribute('data-i18next-editor-element', 'true');
    ribbon.style = "\n  cursor: pointer;\n  position: fixed;\n  bottom: 25px;\n  right: 25px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 50px;\n  height: 50px;\n  background-color:  rgba(249, 249, 249, 0.2);\n  backdrop-filter: blur(3px);\n  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);\n  border-radius: 50%;\n  ";
    ribbon.onclick = function () {
      onMaximize();
    };
    var image = document.createElement('img');
    image.src = locizeIconUrl;
    image.style.width = '45px';
    ribbon.appendChild(image);
    return ribbon;
  }
  function Minimize(popupEle, onMinimize) {
    var image = document.createElement('img');
    image.setAttribute('data-i18next-editor-element', 'true');
    image.src = minimizeIconUrl;
    image.style.width = '24px';
    image.style.cursor = 'pointer';
    image.onclick = function () {
      popupEle.style.setProperty('--i18next-editor-popup-position-top', popupEle.style.top);
      popupEle.style.setProperty('--i18next-editor-popup-position-left', popupEle.style.left);
      popupEle.style.animation = 'i18next-editor-animate-bottom 2s forwards';
      onMinimize();
    };
    return image;
  }
  var popupId = 'i18next-editor-popup';
  function Popup(url, cb) {
    var popup = document.createElement('div');
    popup.setAttribute('id', popupId);
    popup.classList.add('i18next-editor-popup');
    popup.style = "\n  background-color: transparent;\n  border: 1px solid rgba(200, 200, 200, 0.9);\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\n  border-radius: 3px;\n  --i18next-editor-popup-height: 200px;\n  height: var(--i18next-editor-popup-height);\n  min-height: 150px;\n  min-width: 300px;\n  --i18next-editor-popup-width: 400px;\n  width: var(--i18next-editor-popup-width);\n  max-height: 800px;\n  max-width: 1000px;\n\n  position: fixed;\n  --i18next-editor-popup-position-top: calc(100vh - var(--i18next-editor-popup-height) - 10px);\n  top: calc(100vh - var(--i18next-editor-popup-height) - 10px);\n  --i18next-editor-popup-position-left: calc(100vw - var(--i18next-editor-popup-width) - 10px);\n  left: calc(100vw - var(--i18next-editor-popup-width) - 10px);\n\n  overflow: visible;\n  z-index: 99999;\n  ";
    popup.setAttribute('data-i18next-editor-element', 'true');
    var header = document.createElement('div');
    header.classList.add('i18next-editor-popup-header');
    header.style = "\n  padding: 2px 10px;\n  cursor: move;\n  z-index: 10;\n  backdrop-filter: blur(3px);\n  background-color: rgba(200, 200, 200, 0.5);\n  background: linear-gradient(0deg, rgba(200, 200, 200, 0.6), rgba(200, 200, 200, 0.5));\n  color: #fff;\n  text-align: right;\n  ";
    popup.appendChild(header);
    header.appendChild(Minimize(popup, function () {
      var ribbon = Ribbon(popup, function () {
        popup.style.animation = 'i18next-editor-animate-top 1s';
        startMouseTracking();
        setTimeout(function () {
          document.body.removeChild(ribbon);
        }, 1000);
      });
      document.body.appendChild(ribbon);
      stopMouseTracking();
    }));
    var iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'i18next-editor-iframe');
    iframe.setAttribute('data-i18next-editor-element', 'true');
    iframe.style = "\n    z-index: 100;\n    width: 100%;\n    height: calc(100% - 32px);\n    border: none;\n    background: #fff;\n  ";
    iframe.setAttribute('src', url);
    iframe.addEventListener('load', cb);
    popup.appendChild(iframe);
    var overlay = document.createElement('div');
    overlay.setAttribute('id', 'i18next-editor-popup-overlay');
    overlay.setAttribute('data-i18next-editor-element', 'true');
    overlay.style = "\n  display: none;\n  position: absolute;\n  top: 32px;\n  z-index: 101;\n  width: 100%;\n  height: calc(100% - 32px);\n  background-color: rgba(200, 200, 200, 0.5);\n  background: linear-gradient(0deg, rgba(240, 240, 240, 0.6), rgba(255, 255, 255, 0.5));\n  backdrop-filter: blur(2px);\n";
    popup.appendChild(overlay);
    return popup;
  }

  function handler$4(payload) {
    var containerStyle = payload.containerStyle;
    if (containerStyle) {
      var popup = document.getElementById(popupId);
      if (!popup) return;
      var storedPos = window.localStorage.getItem('locize_popup_pos');
      if (storedPos) storedPos = JSON.parse(storedPos);
      var storedSize = window.localStorage.getItem('locize_popup_size');
      if (storedSize) storedSize = JSON.parse(storedSize);
      if (storedSize && storedSize.height && storedSize.width) {
        containerStyle.height = storedSize.height + 'px';
        containerStyle.width = storedSize.width + 'px';
      }
      if (containerStyle.height) {
        var diff = "calc(".concat(containerStyle.height, " - ").concat(popup.style.height, ")");
        popup.style.setProperty('top', "calc(".concat(popup.style.top, " - ").concat(diff, ")"));
        popup.style.setProperty('height', containerStyle.height);
      }
      if (containerStyle.width) {
        var _diff = "calc(".concat(containerStyle.width, " - ").concat(popup.style.width, ")");
        popup.style.setProperty('left', "calc(".concat(popup.style.left, " - ").concat(_diff, ")"));
        popup.style.setProperty('width', containerStyle.width);
      }
      if (storedPos && storedPos.top && storedPos.top < window.innerHeight - containerStyle.height.replace('px', '')) {
        popup.style.setProperty('top', storedPos.top + 'px');
      }
      if (storedPos && storedPos.left && storedPos.left < window.innerWidth - containerStyle.width.replace('px', '')) {
        popup.style.setProperty('left', storedPos.left + 'px');
      }
    }
  }
  api.addHandler('requestPopupChanges', handler$4);

  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }

  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o,
      r,
      i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }

  var _excluded$1 = ["lng", "ns"];
  function ownKeys$4(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$4(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$4(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$4(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  function handler$3(payload) {
    var lng = payload.lng,
      ns = payload.ns,
      rest = _objectWithoutProperties(payload, _excluded$1);
    api.i18n.getResourceBundle(lng, ns, function (resources) {
      api.confirmResourceBundle(_objectSpread$4({
        resources: resources,
        lng: lng,
        ns: ns
      }, rest));
    });
  }
  api.addHandler('requestResourceBundle', handler$3);

  var previousMatches = [];
  function handler$2(payload) {
    var keys = payload.keys;
    var matchingItems = [];
    Object.values(store.data).forEach(function (item) {
      var matches = Object.values(item.keys).filter(function (k) {
        return keys.includes(k.qualifiedKey);
      });
      if (matches.length) {
        matchingItems.push(item);
      }
    });
    previousMatches.forEach(function (item) {
      resetHighlight(item, item.node, item.keys, false);
    });
    matchingItems.forEach(function (item) {
      selectedHighlight(item, item.node, item.keys);
    });
    previousMatches = matchingItems;
  }
  api.addHandler('selectedKeys', handler$2);

  function handler$1(payload, e) {
    api.source = e.source;
    api.origin = e.origin;
    api.sendLocizeIsEnabled(payload);
    api.requestInitialize(api.config);
  }
  api.addHandler('isLocizeEnabled', handler$1);

  function handler(payload) {
    if (!payload.length) return;
    payload.forEach(function (item) {
      var uni = uninstrumentedStore.get(item.eleUniqueID);
      store.save(item.eleUniqueID, undefined, item.textType, extractNodeMeta(item.eleUniqueID, item.textType, _defineProperty({}, "".concat(item.textType), {
        ns: item.ns,
        key: item.key
      }), item.value), uni === null || uni === void 0 ? void 0 : uni.node);
      if (uni && uni.keys) delete uni.keys["".concat(item.textType)];
      if (uni && uni.keys && !Object.keys(uni.keys).length) {
        uninstrumentedStore.remove(item.eleUniqueID, uni.node);
      }
    });
    api.sendCurrentParsedContent();
  }
  api.addHandler('sendMatchedUninstrumented', handler);

  if (sheet) {
    sheet.insertRule('.i18next-editor-button:hover { background-color: rgba(21, 65, 154, 1) !important; }');
  }
  function RibbonButton(text, attrTitle, onClick) {
    var btn = document.createElement('button');
    btn.style = 'font-family: Arial; position: relative; backdrop-filter: blur(3px); cursor: pointer; padding: 2px 10px 2px 20px; font-size: 15px; font-weight: 300; text-transform: uppercase; color: #fff; background-color: rgba(25, 118, 210, 0.8); border: none; border-radius: 12px; ';
    btn.classList.add('i18next-editor-button');
    btn.setAttribute('data-i18next-editor-element', 'true');
    btn.setAttribute('title', attrTitle);
    var icon = EditIcon();
    icon.style = 'position: absolute; left: 4px; top: 3px;';
    icon.style.width = '15px';
    btn.appendChild(icon);
    var span = document.createElement('span');
    span.textContent = text;
    btn.appendChild(span);
    btn.onclick = onClick;
    return btn;
  }
  function RibbonBox() {
    var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var box = document.createElement('div');
    box.classList.add('i18next-editor-button-container');
    box.style = 'position: absolute; top: 0; left: 0; display: flex; align-items: flex-start; justify-content: center; filter: drop-shadow(0px 0px 20px #aaa ); z-index: 99999;';
    box.setAttribute('data-i18next-editor-element', 'true');
    var arrow = document.createElement('div');
    arrow.style = "\n    position: absolute;\n    width: 0;\n    height: 0;\n    border-top-width: 7px;\n    border-bottom-width: 7px;\n    border-left-width: 10px;\n    border-right-width: 10px;\n    border-style: solid;\n    border-color: transparent ".concat(colors.highlight, " transparent\n      transparent;\n    ");
    box.appendChild(arrow);
    var btnbox = document.createElement('div');
    btnbox.style = 'display: flex; flex-direction: column; align-items: flex-start; margin-left: 2px; margin-top: 1px';
    Object.keys(keys).forEach(function (k) {
      var data = keys[k];
      var btn = RibbonButton(k.replace('attr:', ''), "".concat(data.ns, ":").concat(data.key), function () {
        api.selectKey(data);
      });
      btn.style.marginBottom = '2px';
      btnbox.appendChild(btn);
    });
    box.appendChild(btnbox);
    return {
      box: box,
      arrow: arrow
    };
  }

  function HighlightBox(ele, borderColor, shadowColor) {
    var rect = ele.getBoundingClientRect();
    var box = document.createElement('div');
    box.classList.add('i18next-editor-highlight');
    box.style = "position: absolute; z-index: 99999; pointer-events: none; top: ".concat(rect.top - 2 + window.scrollY, "px; left: ").concat(rect.left - 2 + window.scrollX, "px; height: ").concat(rect.height + 4, "px; width: ").concat(rect.width + 4, "px; border: 1px solid ").concat(borderColor, "; border-radius: 2px; ").concat(shadowColor ? "box-shadow: 0 0 20px 0 ".concat(shadowColor, ";") : '');
    box.setAttribute('data-i18next-editor-element', 'true');
    return box;
  }

  /**
   * Custom positioning reference element.
   * @see https://floating-ui.com/docs/virtual-elements
   */

  const sides = ['top', 'right', 'bottom', 'left'];
  const alignments = ['start', 'end'];
  const placements = /*#__PURE__*/sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const createCoords = v => ({
    x: v,
    y: v
  });
  const oppositeSideMap = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  const oppositeAlignmentMap = {
    start: 'end',
    end: 'start'
  };
  function clamp(start, value, end) {
    return max(start, min(value, end));
  }
  function evaluate(value, param) {
    return typeof value === 'function' ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split('-')[0];
  }
  function getAlignment(placement) {
    return placement.split('-')[1];
  }
  function getOppositeAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }
  function getAxisLength(axis) {
    return axis === 'y' ? 'height' : 'width';
  }
  function getSideAxis(placement) {
    return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
  }
  function getSideList(side, isStart, rtl) {
    const lr = ['left', 'right'];
    const rl = ['right', 'left'];
    const tb = ['top', 'bottom'];
    const bt = ['bottom', 'top'];
    switch (side) {
      case 'top':
      case 'bottom':
        if (rtl) return isStart ? rl : lr;
        return isStart ? lr : rl;
      case 'left':
      case 'right':
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === 'start', rtl);
    if (alignment) {
      list = list.map(side => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== 'number' ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === 'y';
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case 'top':
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case 'bottom':
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case 'right':
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case 'left':
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case 'start':
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case 'end':
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
   *
   * This export does not have any `platform` interface logic. You will need to
   * write one for the platform you are using Floating UI with.
   */
  const computePosition$1 = async (reference, floating, config) => {
    const {
      placement = 'bottom',
      strategy = 'absolute',
      middleware = [],
      platform
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
    let rects = await platform.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === 'object') {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };

  /**
   * Resolves with an object of overflow side offsets that determine how much the
   * element is overflowing a given clipping boundary on each side.
   * - positive = overflowing the boundary by that number of pixels
   * - negative = how many pixels left before it will overflow
   * - 0 = lies flush with the boundary
   * @see https://floating-ui.com/docs/detectOverflow
   */
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = 'clippingAncestors',
      rootBoundary = 'viewport',
      elementContext = 'floating',
      altBoundary = false,
      padding = 0
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === 'floating' ? 'reference' : 'floating';
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform.getClippingRect({
      element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === 'floating' ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
    } : rects.reference;
    const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
    const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements,
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow$1 = options => ({
    name: 'arrow',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        platform,
        elements,
        middlewareData
      } = state;
      // Since `element` is required, we don't Partial<> the type.
      const {
        element,
        padding = 0
      } = evaluate(options, state) || {};
      if (element == null) {
        return {};
      }
      const paddingObject = getPaddingObject(padding);
      const coords = {
        x,
        y
      };
      const axis = getAlignmentAxis(placement);
      const length = getAxisLength(axis);
      const arrowDimensions = await platform.getDimensions(element);
      const isYAxis = axis === 'y';
      const minProp = isYAxis ? 'top' : 'left';
      const maxProp = isYAxis ? 'bottom' : 'right';
      const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
      const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
      const startDiff = coords[axis] - rects.reference[axis];
      const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
      let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

      // DOM platform can return `window` as the `offsetParent`.
      if (!clientSize || !(await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent)))) {
        clientSize = elements.floating[clientProp] || rects.floating[length];
      }
      const centerToReference = endDiff / 2 - startDiff / 2;

      // If the padding is large enough that it causes the arrow to no longer be
      // centered, modify the padding so that it is centered.
      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
      const minPadding = min(paddingObject[minProp], largestPossiblePadding);
      const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);

      // Make sure the arrow doesn't overflow the floating element if the center
      // point is outside the floating element's bounds.
      const min$1 = minPadding;
      const max = clientSize - arrowDimensions[length] - maxPadding;
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset = clamp(min$1, center, max);

      // If the reference is small enough that the arrow's padding causes it to
      // to point to nothing for an aligned placement, adjust the offset of the
      // floating element itself. To ensure `shift()` continues to take action,
      // a single reset is performed when this is true.
      const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
      const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max : 0;
      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset,
          centerOffset: center - offset - alignmentOffset,
          ...(shouldAddOffset && {
            alignmentOffset
          })
        },
        reset: shouldAddOffset
      };
    }
  });

  function getPlacementList(alignment, autoAlignment, allowedPlacements) {
    const allowedPlacementsSortedByAlignment = alignment ? [...allowedPlacements.filter(placement => getAlignment(placement) === alignment), ...allowedPlacements.filter(placement => getAlignment(placement) !== alignment)] : allowedPlacements.filter(placement => getSide(placement) === placement);
    return allowedPlacementsSortedByAlignment.filter(placement => {
      if (alignment) {
        return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
      }
      return true;
    });
  }
  /**
   * Optimizes the visibility of the floating element by choosing the placement
   * that has the most space available automatically, without needing to specify a
   * preferred placement. Alternative to `flip`.
   * @see https://floating-ui.com/docs/autoPlacement
   */
  const autoPlacement = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'autoPlacement',
      options,
      async fn(state) {
        var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
        const {
          rects,
          middlewareData,
          placement,
          platform,
          elements
        } = state;
        const {
          crossAxis = false,
          alignment,
          allowedPlacements = placements,
          autoAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);
        const placements$1 = alignment !== undefined || allowedPlacements === placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
        const currentPlacement = placements$1[currentIndex];
        if (currentPlacement == null) {
          return {};
        }
        const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));

        // Make `computeCoords` start from the right place.
        if (placement !== currentPlacement) {
          return {
            reset: {
              placement: placements$1[0]
            }
          };
        }
        const currentOverflows = [overflow[getSide(currentPlacement)], overflow[alignmentSides[0]], overflow[alignmentSides[1]]];
        const allOverflows = [...(((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || []), {
          placement: currentPlacement,
          overflows: currentOverflows
        }];
        const nextPlacement = placements$1[currentIndex + 1];

        // There are more placements to check.
        if (nextPlacement) {
          return {
            data: {
              index: currentIndex + 1,
              overflows: allOverflows
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        const placementsSortedByMostSpace = allOverflows.map(d => {
          const alignment = getAlignment(d.placement);
          return [d.placement, alignment && crossAxis ?
          // Check along the mainAxis and main crossAxis side.
          d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) :
          // Check only the mainAxis.
          d.overflows[0], d.overflows];
        }).sort((a, b) => a[1] - b[1]);
        const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter(d => d[2].slice(0,
        // Aligned placements should not check their opposite crossAxis
        // side.
        getAlignment(d[0]) ? 2 : 3).every(v => v <= 0));
        const resetPlacement = ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
        if (resetPlacement !== placement) {
          return {
            data: {
              index: currentIndex + 1,
              overflows: allOverflows
            },
            reset: {
              placement: resetPlacement
            }
          };
        }
        return {};
      }
    };
  };

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip$1 = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'flip',
      options,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = 'bestFit',
          fallbackAxisSideDirection = 'none',
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);

        // If a reset by the arrow was caused due to an alignment offset being
        // added, we should skip any logic now since `flip()` has already done its
        // work.
        // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides[0]], overflow[sides[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];

        // One or more sides is overflowing.
        if (!overflows.every(side => side <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements[nextIndex];
          if (nextPlacement) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }

          // First, find the candidates that fit on the mainAxis side of overflow,
          // then find the placement that fits the best on the main crossAxis side.
          let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

          // Otherwise fallback.
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case 'bestFit':
                {
                  var _overflowsData$filter2;
                  const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                    if (hasFallbackAxisSideDirection) {
                      const currentSideAxis = getSideAxis(d.placement);
                      return currentSideAxis === initialSideAxis ||
                      // Create a bias to the `y` side axis due to horizontal
                      // reading directions favoring greater width.
                      currentSideAxis === 'y';
                    }
                    return true;
                  }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                  if (placement) {
                    resetPlacement = placement;
                  }
                  break;
                }
              case 'initialPlacement':
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };

  function getSideOffsets(overflow, rect) {
    return {
      top: overflow.top - rect.height,
      right: overflow.right - rect.width,
      bottom: overflow.bottom - rect.height,
      left: overflow.left - rect.width
    };
  }
  function isAnySideFullyClipped(overflow) {
    return sides.some(side => overflow[side] >= 0);
  }
  /**
   * Provides data to hide the floating element in applicable situations, such as
   * when it is not in the same clipping context as the reference element.
   * @see https://floating-ui.com/docs/hide
   */
  const hide = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'hide',
      options,
      async fn(state) {
        const {
          rects
        } = state;
        const {
          strategy = 'referenceHidden',
          ...detectOverflowOptions
        } = evaluate(options, state);
        switch (strategy) {
          case 'referenceHidden':
            {
              const overflow = await detectOverflow(state, {
                ...detectOverflowOptions,
                elementContext: 'reference'
              });
              const offsets = getSideOffsets(overflow, rects.reference);
              return {
                data: {
                  referenceHiddenOffsets: offsets,
                  referenceHidden: isAnySideFullyClipped(offsets)
                }
              };
            }
          case 'escaped':
            {
              const overflow = await detectOverflow(state, {
                ...detectOverflowOptions,
                altBoundary: true
              });
              const offsets = getSideOffsets(overflow, rects.floating);
              return {
                data: {
                  escapedOffsets: offsets,
                  escaped: isAnySideFullyClipped(offsets)
                }
              };
            }
          default:
            {
              return {};
            }
        }
      }
    };
  };

  function getBoundingRect(rects) {
    const minX = min(...rects.map(rect => rect.left));
    const minY = min(...rects.map(rect => rect.top));
    const maxX = max(...rects.map(rect => rect.right));
    const maxY = max(...rects.map(rect => rect.bottom));
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  function getRectsByLine(rects) {
    const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
    const groups = [];
    let prevRect = null;
    for (let i = 0; i < sortedRects.length; i++) {
      const rect = sortedRects[i];
      if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) {
        groups.push([rect]);
      } else {
        groups[groups.length - 1].push(rect);
      }
      prevRect = rect;
    }
    return groups.map(rect => rectToClientRect(getBoundingRect(rect)));
  }
  /**
   * Provides improved positioning for inline reference elements that can span
   * over multiple lines, such as hyperlinks or range selections.
   * @see https://floating-ui.com/docs/inline
   */
  const inline = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'inline',
      options,
      async fn(state) {
        const {
          placement,
          elements,
          rects,
          platform,
          strategy
        } = state;
        // A MouseEvent's client{X,Y} coords can be up to 2 pixels off a
        // ClientRect's bounds, despite the event listener being triggered. A
        // padding of 2 seems to handle this issue.
        const {
          padding = 2,
          x,
          y
        } = evaluate(options, state);
        const nativeClientRects = Array.from((await (platform.getClientRects == null ? void 0 : platform.getClientRects(elements.reference))) || []);
        const clientRects = getRectsByLine(nativeClientRects);
        const fallback = rectToClientRect(getBoundingRect(nativeClientRects));
        const paddingObject = getPaddingObject(padding);
        function getBoundingClientRect() {
          // There are two rects and they are disjoined.
          if (clientRects.length === 2 && clientRects[0].left > clientRects[1].right && x != null && y != null) {
            // Find the first rect in which the point is fully inside.
            return clientRects.find(rect => x > rect.left - paddingObject.left && x < rect.right + paddingObject.right && y > rect.top - paddingObject.top && y < rect.bottom + paddingObject.bottom) || fallback;
          }

          // There are 2 or more connected rects.
          if (clientRects.length >= 2) {
            if (getSideAxis(placement) === 'y') {
              const firstRect = clientRects[0];
              const lastRect = clientRects[clientRects.length - 1];
              const isTop = getSide(placement) === 'top';
              const top = firstRect.top;
              const bottom = lastRect.bottom;
              const left = isTop ? firstRect.left : lastRect.left;
              const right = isTop ? firstRect.right : lastRect.right;
              const width = right - left;
              const height = bottom - top;
              return {
                top,
                bottom,
                left,
                right,
                width,
                height,
                x: left,
                y: top
              };
            }
            const isLeftSide = getSide(placement) === 'left';
            const maxRight = max(...clientRects.map(rect => rect.right));
            const minLeft = min(...clientRects.map(rect => rect.left));
            const measureRects = clientRects.filter(rect => isLeftSide ? rect.left === minLeft : rect.right === maxRight);
            const top = measureRects[0].top;
            const bottom = measureRects[measureRects.length - 1].bottom;
            const left = minLeft;
            const right = maxRight;
            const width = right - left;
            const height = bottom - top;
            return {
              top,
              bottom,
              left,
              right,
              width,
              height,
              x: left,
              y: top
            };
          }
          return fallback;
        }
        const resetRects = await platform.getElementRects({
          reference: {
            getBoundingClientRect
          },
          floating: elements.floating,
          strategy
        });
        if (rects.reference.x !== resetRects.reference.x || rects.reference.y !== resetRects.reference.y || rects.reference.width !== resetRects.reference.width || rects.reference.height !== resetRects.reference.height) {
          return {
            reset: {
              rects: resetRects
            }
          };
        }
        return {};
      }
    };
  };

  // For type backwards-compatibility, the `OffsetOptions` type was also
  // Derivable.

  async function convertValueToCoords(state, options) {
    const {
      placement,
      platform,
      elements
    } = state;
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === 'y';
    const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);

    // eslint-disable-next-line prefer-const
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === 'number' ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
    };
    if (alignment && typeof alignmentAxis === 'number') {
      crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset$1 = function (options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: 'offset',
      options,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state;
        const diffCoords = await convertValueToCoords(state, options);

        // If the placement is the same and the arrow caused an alignment offset
        // then we don't need to change the positioning coordinates.
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift$1 = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'shift',
      options,
      async fn(state) {
        const {
          x,
          y,
          placement
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: _ref => {
              let {
                x,
                y
              } = _ref;
              return {
                x,
                y
              };
            }
          },
          ...detectOverflowOptions
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === 'y' ? 'top' : 'left';
          const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
          const min = mainAxisCoord + overflow[minSide];
          const max = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min, mainAxisCoord, max);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === 'y' ? 'top' : 'left';
          const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
          const min = crossAxisCoord + overflow[minSide];
          const max = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min, crossAxisCoord, max);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis
            }
          }
        };
      }
    };
  };
  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      options,
      fn(state) {
        const {
          x,
          y,
          placement,
          rects,
          middlewareData
        } = state;
        const {
          offset = 0,
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const crossAxis = getSideAxis(placement);
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        const rawOffset = evaluate(offset, state);
        const computedOffset = typeof rawOffset === 'number' ? {
          mainAxis: rawOffset,
          crossAxis: 0
        } : {
          mainAxis: 0,
          crossAxis: 0,
          ...rawOffset
        };
        if (checkMainAxis) {
          const len = mainAxis === 'y' ? 'height' : 'width';
          const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
          const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
          if (mainAxisCoord < limitMin) {
            mainAxisCoord = limitMin;
          } else if (mainAxisCoord > limitMax) {
            mainAxisCoord = limitMax;
          }
        }
        if (checkCrossAxis) {
          var _middlewareData$offse, _middlewareData$offse2;
          const len = mainAxis === 'y' ? 'width' : 'height';
          const isOriginSide = ['top', 'left'].includes(getSide(placement));
          const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
          const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
          if (crossAxisCoord < limitMin) {
            crossAxisCoord = limitMin;
          } else if (crossAxisCoord > limitMax) {
            crossAxisCoord = limitMax;
          }
        }
        return {
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        };
      }
    };
  };

  /**
   * Provides data that allows you to change the size of the floating element —
   * for instance, prevent it from overflowing the clipping boundary or match the
   * width of the reference element.
   * @see https://floating-ui.com/docs/size
   */
  const size = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'size',
      options,
      async fn(state) {
        var _state$middlewareData, _state$middlewareData2;
        const {
          placement,
          rects,
          platform,
          elements
        } = state;
        const {
          apply = () => {},
          ...detectOverflowOptions
        } = evaluate(options, state);
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const side = getSide(placement);
        const alignment = getAlignment(placement);
        const isYAxis = getSideAxis(placement) === 'y';
        const {
          width,
          height
        } = rects.floating;
        let heightSide;
        let widthSide;
        if (side === 'top' || side === 'bottom') {
          heightSide = side;
          widthSide = alignment === ((await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating))) ? 'start' : 'end') ? 'left' : 'right';
        } else {
          widthSide = side;
          heightSide = alignment === 'end' ? 'top' : 'bottom';
        }
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        const maximumClippingWidth = width - overflow.left - overflow.right;
        const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
        const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
        const noShift = !state.middlewareData.shift;
        let availableHeight = overflowAvailableHeight;
        let availableWidth = overflowAvailableWidth;
        if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
          availableWidth = maximumClippingWidth;
        }
        if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
          availableHeight = maximumClippingHeight;
        }
        if (noShift && !alignment) {
          const xMin = max(overflow.left, 0);
          const xMax = max(overflow.right, 0);
          const yMin = max(overflow.top, 0);
          const yMax = max(overflow.bottom, 0);
          if (isYAxis) {
            availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
          } else {
            availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
          }
        }
        await apply({
          ...state,
          availableWidth,
          availableHeight
        });
        const nextDimensions = await platform.getDimensions(elements.floating);
        if (width !== nextDimensions.width || height !== nextDimensions.height) {
          return {
            reset: {
              rects: true
            }
          };
        }
        return {};
      }
    };
  };

  function hasWindow() {
    return typeof window !== 'undefined';
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || '').toLowerCase();
    }
    // Mocked nodes in testing environments may not be instances of Node. By
    // returning `#document` an infinite loop won't occur.
    // https://github.com/floating-ui/floating-ui/issues/2317
    return '#document';
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === 'undefined') {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
  }
  function isTableElement(element) {
    return ['table', 'td', 'th'].includes(getNodeName(element));
  }
  function isTopLayer(element) {
    return [':popover-open', ':modal'].some(selector => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    // https://drafts.csswg.org/css-transforms-2/#individual-transforms
    return ['transform', 'translate', 'scale', 'rotate', 'perspective'].some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    return CSS.supports('-webkit-backdrop-filter', 'none');
  }
  function isLastTraversableNode(node) {
    return ['html', 'body', '#document'].includes(getNodeName(node));
  }
  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === 'html') {
      return node;
    }
    const result =
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot ||
    // DOM Element detected.
    node.parentNode ||
    // ShadowRoot detected.
    isShadowRoot(node) && node.host ||
    // Fallback.
    getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  function getCssDimensions(element) {
    const css = getComputedStyle(element);
    // In testing environments, the `width` and `height` properties are empty
    // strings for SVG elements, returning NaN. Fallback to `0` in this case.
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }

  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }

  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;

    // 0, NaN, or Infinity should always fallback to 1.

    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }

  const noOffsets = /*#__PURE__*/createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }

  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }

  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }

  function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
    if (ignoreScrollbarX === void 0) {
      ignoreScrollbarX = false;
    }
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 :
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect));
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }

  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === 'fixed';
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }

  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }

  // Gets the entire size of the scrollable document area, even extending outside
  // of the `<html>` and `<body>` rect bounds if horizontally scrollable.
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle(body).direction === 'rtl') {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  // Returns the inner client rect, subtracting scrollbars if present.
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === 'viewport') {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === 'document') {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
  }

  // A "clipping ancestor" is an `overflow` element with the characteristic of
  // clipping (or hiding) child elements. This returns all clipping ancestors
  // of the given element up the tree.
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle(element).position === 'fixed';
    let currentNode = elementIsFixed ? getParentNode(element) : element;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        // Drop non-containing blocks.
        result = result.filter(ancestor => ancestor !== currentNode);
      } else {
        // Record last containing block for next iteration.
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }

  // Gets the maximum area that the element is visible in due to any number of
  // clipping ancestors.
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }

  function getDimensions(element) {
    const {
      width,
      height
    } = getCssDimensions(element);
    return {
      width,
      height
    };
  }

  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === 'fixed';
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
        // Firefox with layout.scrollbar.side = 3 in about:config to test this.
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }

  function isStaticPositioned(element) {
    return getComputedStyle(element).position === 'static';
  }

  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;

    // Firefox returns the <html> element as the offsetParent if it's non-static,
    // while Chrome and Safari return the <body> element. The <body> element must
    // be used to perform the correct calculations even if the <html> element is
    // non-static.
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }

  // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }

  const getElementRects = async function (data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };

  function isRTL(element) {
    return getComputedStyle(element).direction === 'rtl';
  }

  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = offset$1;

  /**
   * Optimizes the visibility of the floating element by choosing the placement
   * that has the most space available automatically, without needing to specify a
   * preferred placement. Alternative to `flip`.
   * @see https://floating-ui.com/docs/autoPlacement
   */
  autoPlacement;

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift = shift$1;

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = flip$1;

  /**
   * Provides data that allows you to change the size of the floating element —
   * for instance, prevent it from overflowing the clipping boundary or match the
   * width of the reference element.
   * @see https://floating-ui.com/docs/size
   */
  size;

  /**
   * Provides data to hide the floating element in applicable situations, such as
   * when it is not in the same clipping context as the reference element.
   * @see https://floating-ui.com/docs/hide
   */
  hide;

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow = arrow$1;

  /**
   * Provides improved positioning for inline reference elements that can span
   * over multiple lines, such as hyperlinks or range selections.
   * @see https://floating-ui.com/docs/inline
   */
  inline;

  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  limitShift;

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
   */
  const computePosition = (reference, floating, options) => {
    // This caches the expensive `getClippingElementAncestors` function so that
    // multiple lifecycle resets re-use the same result. It only lives for a
    // single call. If other functions become expensive, we can add them as well.
    const cache = new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition$1(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  var selected = {};
  function highlight(item, node, keys) {
    var rectEle = getOptimizedBoundingRectEle(node);
    if (!item.highlightBox) {
      var box = HighlightBox(rectEle, colors.highlight);
      document.body.appendChild(box);
      item.highlightBox = box;
    }
    if (!item.ribbonBox) {
      var _RibbonBox = RibbonBox(keys),
        actions = _RibbonBox.box,
        arrowEle = _RibbonBox.arrow;
      document.body.appendChild(actions);
      computePosition(rectEle, actions, {
        placement: 'right',
        middleware: [flip({
          fallbackPlacements: ['left', 'bottom']
        }), shift(), offset(function (_ref) {
          var placement = _ref.placement,
            rects = _ref.rects;
          if (placement === 'bottom') return -rects.reference.height / 2 - rects.floating.height / 2;
          return 35;
        }), arrow({
          element: arrowEle
        })]
      }).then(function (_ref2) {
        var x = _ref2.x,
          y = _ref2.y,
          middlewareData = _ref2.middlewareData,
          placement = _ref2.placement;
        Object.assign(actions.style, {
          left: "".concat(x, "px"),
          top: "".concat(y, "px"),
          display: 'inline-flex'
        });
        var side = placement.split('-')[0];
        var staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right'
        }[side];
        if (middlewareData.arrow) {
          var _middlewareData$arrow = middlewareData.arrow,
            _x = _middlewareData$arrow.x,
            _y = _middlewareData$arrow.y;
          Object.assign(arrowEle.style, _defineProperty(_defineProperty({
            left: _x != null ? "".concat(_x, "px") : '',
            top: _y != null ? "".concat(_y, "px") : '',
            right: '',
            bottom: ''
          }, staticSide, "".concat(side === 'bottom' ? -18 : -25, "px")), "transform", side === 'bottom' ? 'rotate(90deg)' : side === 'left' ? 'rotate(180deg)' : ''));
        }
      });
      item.ribbonBox = actions;
    }
  }
  function highlightUninstrumented(item, node, keys) {
    var id = item.id;
    if (selected[id]) return;
    var rectEle = getOptimizedBoundingRectEle(node);
    if (!item.highlightBox) {
      var box = HighlightBox(rectEle, colors.warning);
      document.body.appendChild(box);
      item.highlightBox = box;
    }
  }
  function selectedHighlight(item, node, keys) {
    var id = item.id;
    var rectEle = getOptimizedBoundingRectEle(node);
    if (!item.highlightBox) {
      var box = HighlightBox(rectEle, colors.highlight, colors.gray);
      document.body.appendChild(box);
      item.highlightBox = box;
    }
    selected[id] = true;
  }
  function recalcSelectedHighlight(item, node, keys) {
    if (!selected[item.id]) return;
    resetHighlight(item, node, keys, false);
    selectedHighlight(item, node);
  }
  function resetHighlight(item, node, keys) {
    var ignoreSelected = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var id = item.id;
    if (ignoreSelected && selected[id]) return;
    if (item.highlightBox) {
      document.body.removeChild(item.highlightBox);
      delete item.highlightBox;
    }
    if (item.ribbonBox) {
      document.body.removeChild(item.ribbonBox);
      delete item.ribbonBox;
    }
    delete selected[id];
  }

  function ownKeys$3(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$3(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$3(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$3(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var data = {};
  function clean() {
    Object.values(data).forEach(function (item) {
      if (!document.body.contains(item.node)) {
        resetHighlight(item.id, item.node);
        delete data[item.id];
      }
    });
  }
  function save(id, subliminal, type, meta, node, children) {
    if (!id || !type || !meta || !node) return;
    if (!data[id]) {
      data[id] = {
        id: id,
        node: node,
        subliminal: subliminal
      };
    }
    if (subliminal) data[id].subliminal = subliminal;
    data[id].keys = _objectSpread$3(_objectSpread$3({}, data[id].keys), {}, _defineProperty({}, "".concat(type), meta));
    if (children) {
      data[id].children = _objectSpread$3(_objectSpread$3({}, data[id].children), {}, _defineProperty({}, "".concat(type, "-").concat(children.map(function (c) {
        return c.childIndex;
      }).join(',')), children));
    }
  }
  function get(id) {
    return data[id];
  }
  var store = {
    save: save,
    clean: clean,
    get: get,
    data: data
  };

  (function () {

    if (typeof Document === 'undefined') return;
    var nextID = 1;
    if (Document.prototype.hasOwnProperty('uniqueID')) {
      return;
    }
    console.info('"document.uniqueID" not implemented; creating shim');
    Object.defineProperty(Document.prototype, 'uniqueID', {
      get: function get() {
        return nextID++;
      },
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(Element.prototype, 'uniqueID', {
      get: function get() {
        Object.defineProperty(this, 'uniqueID', {
          value: document.uniqueID,
          writable: false,
          enumerable: false,
          configurable: false
        });
        return this.uniqueID;
      },
      enumerable: false,
      configurable: true
    });
  })();

  function ownKeys$2(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$2(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$2(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var currentSourceLng;
  var i18n;
  var ignoreMergedEleUniqueIds = [];
  function setImplementation(impl) {
    i18n = impl;
  }
  function walk(node, func) {
    if (node.dataset && node.dataset.i18nextEditorElement === 'true') return;
    func(node);
    var instr = store.get(node.uniqueID);
    var uninstr = uninstrumentedStore.get(node.uniqueID);
    if (instr || uninstr) {
      var _node$parentElement;
      var id = (_node$parentElement = node.parentElement) === null || _node$parentElement === void 0 ? void 0 : _node$parentElement.uniqueID;
      uninstrumentedStore.remove(id, node.parentElement);
    }
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      walk(children[i], func);
    }
  }
  function extractHiddenMeta(id, type, meta, children) {
    var _i18n, _i18n2, _i18n3;
    var invisibleMeta = meta.invisibleMeta,
      text = meta.text;
    if (!invisibleMeta || !invisibleMeta.key || !invisibleMeta.ns) return;
    if (!currentSourceLng) currentSourceLng = i18n.getSourceLng();
    return _objectSpread$2(_objectSpread$2({
      eleUniqueID: id,
      textType: type,
      children: children && children.map ? children.map(function (c) {
        return c.childIndex;
      }).join(',') : null,
      qualifiedKey: "".concat(invisibleMeta.ns, ":").concat(invisibleMeta.key)
    }, invisibleMeta), {}, {
      extractedText: text,
      i18nTargetLng: (_i18n = i18n) === null || _i18n === void 0 ? void 0 : _i18n.getLng(),
      i18nSourceLng: currentSourceLng,
      i18nRawText: _defineProperty(_defineProperty({}, "".concat(invisibleMeta.lng), invisibleMeta.source === 'translation' && i18n ? (_i18n2 = i18n) === null || _i18n2 === void 0 ? void 0 : _i18n2.getResource(invisibleMeta.lng, invisibleMeta.ns, invisibleMeta.key) : null), "".concat(currentSourceLng), invisibleMeta.source === 'translation' && i18n ? (_i18n3 = i18n) === null || _i18n3 === void 0 ? void 0 : _i18n3.getResource(currentSourceLng, invisibleMeta.ns, invisibleMeta.key) : null)
    });
  }
  function extractNodeMeta(id, type) {
    var _i18n4, _i18n5, _i18n6, _i18n7, _i18n8;
    var nodeMeta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var text = arguments.length > 3 ? arguments[3] : undefined;
    var children = arguments.length > 4 ? arguments[4] : undefined;
    var meta = nodeMeta[type];
    if (!meta) return;
    if (!currentSourceLng) currentSourceLng = i18n.getSourceLng();
    var i18nTargetLng = i18n.getLng();
    return {
      eleUniqueID: id,
      textType: type,
      children: children && children.map ? children.map(function (c) {
        return c.childIndex;
      }).join(',') : null,
      qualifiedKey: meta.key && (meta.ns || (_i18n4 = i18n) !== null && _i18n4 !== void 0 && _i18n4.getDefaultNS()) ? "".concat(meta.ns || ((_i18n5 = i18n) === null || _i18n5 === void 0 ? void 0 : _i18n5.getDefaultNS()), ":").concat(meta.key) : null,
      key: meta.key,
      ns: meta.ns || ((_i18n6 = i18n) === null || _i18n6 === void 0 ? void 0 : _i18n6.getDefaultNS()),
      extractedText: text,
      i18nTargetLng: i18nTargetLng,
      i18nSourceLng: currentSourceLng,
      i18nRawText: _defineProperty(_defineProperty({}, "".concat(i18nTargetLng), i18n && meta.ns && meta.key ? ((_i18n7 = i18n) === null || _i18n7 === void 0 ? void 0 : _i18n7.getResource(i18nTargetLng, meta.ns, meta.key)) || text : text), "".concat(currentSourceLng), i18n && meta.ns && meta.key ? (_i18n8 = i18n) === null || _i18n8 === void 0 ? void 0 : _i18n8.getResource(currentSourceLng, meta.ns, meta.key) : null)
    };
  }
  function containsOnlySpaces(str) {
    return /^\s*$/.test(str);
  }
  function storeIfQualifiedKey(id, subliminal, type, nodeI18nMeta, node, children, txt) {
    var stored = store.get(id);
    var storedMeta = stored && stored.keys["".concat(type)] || {};
    var typeMeta = nodeI18nMeta["".concat(type)] || {};
    if (!typeMeta.key && storedMeta.key) typeMeta.key = storedMeta.key;
    if (!typeMeta.ns && storedMeta.ns) typeMeta.ns = storedMeta.ns;
    nodeI18nMeta["".concat(type)] = typeMeta;
    var meta = extractNodeMeta(id, type, nodeI18nMeta, txt, children);
    if (meta.qualifiedKey) {
      store.save(id, null, type, meta, node, children);
      uninstrumentedStore.removeKey(id, type, node);
    } else {
      uninstrumentedStore.save(id, type, node, txt);
    }
  }
  function handleNode(node) {
    if (ignoreElements.indexOf(node.nodeName) > -1) return;
    var nodeI18nMeta = getI18nMetaFromNode(node);
    var usedSubliminalForText = false;
    if (node.childNodes && !ignoreMergedEleUniqueIds.includes(node.uniqueID)) {
      var merge = [];
      node.childNodes.forEach(function (child, i) {
        if (merge.length && child.nodeName !== '#text') {
          ignoreMergedEleUniqueIds.push(child.uniqueID);
          merge.push({
            childIndex: i,
            child: child
          });
        }
        if (child.nodeName !== '#text') return;
        var txt = child.textContent;
        if (containsOnlySpaces(txt)) return;
        var hasHiddenMeta = containsHiddenMeta(txt);
        var hasHiddenStartMarker = containsHiddenStartMarker(txt);
        if (hasHiddenMeta) usedSubliminalForText = true;
        if (hasHiddenStartMarker && hasHiddenMeta) {
          var meta = unwrap(txt);
          uninstrumentedStore.remove(node.uniqueID, node);
          store.save(node.uniqueID, meta.invisibleMeta, 'text', extractHiddenMeta(node.uniqueID, 'text', meta), node);
        } else if (hasHiddenStartMarker) {
          merge.push({
            childIndex: i,
            child: child,
            text: txt
          });
        } else if (merge.length && !hasHiddenMeta) {
          merge.push({
            childIndex: i,
            child: child,
            text: txt
          });
        } else if (merge.length && hasHiddenMeta) {
          merge.push({
            childIndex: i,
            child: child,
            text: txt
          });
          var _meta = unwrap(merge.reduce(function (mem, item) {
            return mem + item.text;
          }, ''));
          uninstrumentedStore.removeKey(node.uniqueID, 'html', node, txt);
          store.save(node.uniqueID, _meta.invisibleMeta, 'html', extractHiddenMeta(node.uniqueID, 'html', _meta, merge), node, merge);
          merge = [];
        }
      });
      if (!usedSubliminalForText) {
        node.childNodes.forEach(function (child, i) {
          if (merge.length && child.nodeName !== '#text') {
            ignoreMergedEleUniqueIds.push(child.uniqueID);
          }
          var txt = child.textContent;
          if (nodeI18nMeta && nodeI18nMeta.html && i < node.childNodes.length - 1) {
            merge.push({
              childIndex: i,
              child: child,
              text: txt
            });
          } else if (nodeI18nMeta && nodeI18nMeta.html && i === node.childNodes.length - 1) {
            merge.push({
              childIndex: i,
              child: child,
              text: txt
            });
            storeIfQualifiedKey(node.uniqueID, null, 'html', nodeI18nMeta, node, merge, node.innerHTML);
            merge = [];
          } else if (txt) {
            if (nodeI18nMeta && nodeI18nMeta.text) {
              storeIfQualifiedKey(node.uniqueID, null, 'text', nodeI18nMeta, node, undefined, txt);
            } else if (child.nodeName === '#text' && !containsOnlySpaces(txt)) {
              uninstrumentedStore.save(node.uniqueID, 'text', node, txt);
            }
          }
        });
      }
    }
    if (!node.getAttribute) return;
    validAttributes.forEach(function (attr) {
      var txt = node.getAttribute(attr);
      if (containsHiddenMeta(txt)) {
        var meta = unwrap(txt);
        uninstrumentedStore.removeKey(node.uniqueID, attr, node);
        store.save(node.uniqueID, meta.invisibleMeta, attr, extractHiddenMeta(node.uniqueID, "".concat(attr), meta), node);
      } else if (txt) {
        if (nodeI18nMeta && nodeI18nMeta[attr]) {
          storeIfQualifiedKey(node.uniqueID, null, attr, nodeI18nMeta, node, undefined, txt);
        } else {
          uninstrumentedStore.save(node.uniqueID, attr, node, txt);
        }
      }
    });
  }
  function parseTree(node) {
    currentSourceLng = undefined;
    walk(node, handleNode);
    store.clean();
    ignoreMergedEleUniqueIds = [];
    return store.data;
  }

  var mutationTriggeringElements = {};
  function ignoreMutation(ele) {
    if (ele.uniqueID) {
      var info = mutationTriggeringElements[ele.uniqueID];
      if (info && info.triggered > 10 && info.lastTriggerDate + 500 < Date.now()) {
        if (!info.warned && console) {
          console.warn('locize ::: ignoring element change - an element is rerendering too often in short interval', '\n', 'consider adding the "data-locize-editor-ignore:" attribute to the element:', ele);
          info.warned = true;
        }
        return true;
      }
    }
    var ret = ele.dataset && (ele.dataset.i18nextEditorElement === 'true' || ele.dataset.locizeEditorIgnore === 'true');
    if (!ret && ele.parentElement) return ignoreMutation(ele.parentElement);
    return ret;
  }
  function createObserver(ele, handle) {
    var internalChange;
    var lastToggleTimeout;
    var toggleInternal = function toggleInternal() {
      if (lastToggleTimeout) clearTimeout(lastToggleTimeout);
      lastToggleTimeout = setTimeout(function () {
        if (internalChange) internalChange = false;
      }, 200);
    };
    var targetEles = [];
    var debouncedHandler = debounce(function h() {
      handle(targetEles);
      targetEles = [];
    }, 100);
    var observer = new MutationObserver(function (mutations) {
      if (internalChange) {
        toggleInternal();
        return;
      }
      var triggerMutation = false;
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && !validAttributes.includes(mutation.attributeName)) {
          return;
        }
        Object.keys(mutationTriggeringElements).forEach(function (k) {
          var info = mutationTriggeringElements[k];
          if (info.lastTriggerDate + 60000 < Date.now()) {
            delete mutationTriggeringElements[k];
          }
        });
        if (mutation.type === 'childList') {
          var notOurs = 0;
          if (!ignoreMutation(mutation.target)) {
            mutation.addedNodes.forEach(function (n) {
              if (ignoreMutation(n)) return;
              notOurs = notOurs + 1;
            }, 0);
            mutation.removedNodes.forEach(function (n) {
              if (ignoreMutation(n)) return;
              notOurs = notOurs + 1;
            }, 0);
          }
          if (notOurs === 0) return;
        }
        triggerMutation = true;
        if (mutation.target && mutation.target.uniqueID) {
          var info = mutationTriggeringElements[mutation.target.uniqueID] || {
            triggered: 0
          };
          info.triggered = info.triggered + 1;
          info.lastTriggerDate = Date.now();
          mutationTriggeringElements[mutation.target.uniqueID] = info;
        }
        var includedAlready = targetEles.reduce(function (mem, element) {
          if (mem || element.contains(mutation.target) || !mutation.target.parentElement) {
            return true;
          }
          return false;
        }, false);
        if (!includedAlready) {
          targetEles = targetEles.filter(function (element) {
            return !mutation.target.contains(element);
          });
          targetEles.push(mutation.target);
        }
      });
      if (triggerMutation) debouncedHandler();
    });
    return {
      start: function start() {
        var observerConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        };
        handle([ele]);
        observer.observe(ele, observerConfig);
      },
      skipNext: function skipNext() {
        internalChange = true;
      }
    };
  }

  function initDragElement() {
    var pos1 = 0;
    var pos2 = 0;
    var pos3 = 0;
    var pos4 = 0;
    var popups = document.getElementsByClassName('i18next-editor-popup');
    var elmnt = null;
    var overlay = null;
    var currentZIndex = 100;
    for (var i = 0; i < popups.length; i++) {
      var popup = popups[i];
      var header = getHeader(popup);
      popup.onmousedown = function () {
        this.style.zIndex = '' + ++currentZIndex;
      };
      if (header) {
        header.parentPopup = popup;
        header.onmousedown = dragMouseDown;
      }
    }
    function dragMouseDown(e) {
      if (!overlay) {
        overlay = document.getElementById('i18next-editor-popup-overlay');
      }
      if (overlay) overlay.style.display = 'block';
      stopMouseTracking();
      elmnt = this.parentPopup;
      elmnt.style.zIndex = '' + ++currentZIndex;
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      if (!elmnt) {
        return;
      }
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    }
    function closeDragElement() {
      startMouseTracking();
      if (overlay) overlay.style.display = 'none';
      var ele = document.getElementById('i18next-editor-popup');
      window.localStorage.setItem('locize_popup_pos', JSON.stringify({
        top: parseInt(document.defaultView.getComputedStyle(ele).top, 10),
        left: parseInt(document.defaultView.getComputedStyle(ele).left, 10)
      }));
      document.onmouseup = null;
      document.onmousemove = null;
    }
    function getHeader(element) {
      var headerItems = element.getElementsByClassName('i18next-editor-popup-header');
      if (headerItems.length === 1) {
        return headerItems[0];
      }
      return null;
    }
  }
  function initResizeElement() {
    var popups = document.getElementsByClassName('i18next-editor-popup');
    var element = null;
    var overlay = null;
    var startX, startY, startWidth, startHeight;
    for (var i = 0; i < popups.length; i++) {
      var p = popups[i];
      var right = document.createElement('div');
      right.className = 'resizer-right';
      p.appendChild(right);
      right.addEventListener('mousedown', initDrag, false);
      right.parentPopup = p;
      var bottom = document.createElement('div');
      bottom.className = 'resizer-bottom';
      p.appendChild(bottom);
      bottom.addEventListener('mousedown', initDrag, false);
      bottom.parentPopup = p;
      var both = document.createElement('div');
      both.className = 'resizer-both';
      p.appendChild(both);
      both.addEventListener('mousedown', initDrag, false);
      both.parentPopup = p;
    }
    function initDrag(e) {
      stopMouseTracking();
      if (!overlay) {
        overlay = document.getElementById('i18next-editor-popup-overlay');
      }
      if (overlay) overlay.style.display = 'block';
      element = this.parentPopup;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
      document.documentElement.addEventListener('mousemove', doDrag, false);
      document.documentElement.addEventListener('mouseup', stopDrag, false);
    }
    function doDrag(e) {
      element.style.width = startWidth + e.clientX - startX + 'px';
      element.style.height = startHeight + e.clientY - startY + 'px';
    }
    function stopDrag() {
      startMouseTracking();
      if (overlay) overlay.style.display = 'none';
      var ele = document.getElementById('i18next-editor-popup');
      window.localStorage.setItem('locize_popup_size', JSON.stringify({
        width: parseInt(document.defaultView.getComputedStyle(ele).width, 10),
        height: parseInt(document.defaultView.getComputedStyle(ele).height, 10)
      }));
      document.documentElement.removeEventListener('mousemove', doDrag, false);
      document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }
  }

  function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  function getImplementation$1(i18n) {
    var impl = {
      getResource: function getResource(lng, ns, key) {
        return i18n.getResource && i18n.getResource(lng, ns, key);
      },
      setResource: function setResource(lng, ns, key, value) {
        return i18n.addResource(lng, ns, key, value, {
          silent: true
        });
      },
      getResourceBundle: function getResourceBundle(lng, ns, cb) {
        i18n.loadNamespaces(ns, function () {
          cb(i18n.getResourceBundle(lng, ns));
        });
      },
      getDefaultNS: function getDefaultNS() {
        return i18n.options.defaultNS;
      },
      getLng: function getLng() {
        return i18n.resolvedLanguage || i18n.languages && i18n.languages[0] || i18n.options.lng;
      },
      getSourceLng: function getSourceLng() {
        var fallback = i18n.options.fallbackLng;
        if (typeof fallback === 'string') return fallback;
        if (Array.isArray(fallback)) return fallback[fallback.length - 1];
        if (fallback && fallback["default"]) {
          if (typeof fallback["default"] === 'string') return fallback;
          if (Array.isArray(fallback["default"])) {
            return fallback["default"][fallback["default"].length - 1];
          }
        }
        if (typeof fallback === 'function') {
          var res = fallback(i18n.resolvedLanguage);
          if (typeof res === 'string') return res;
          if (Array.isArray(res)) return res[res.length - 1];
        }
        return 'dev';
      },
      getLocizeDetails: function getLocizeDetails() {
        var backendName;
        if (i18n.services.backendConnector.backend && i18n.services.backendConnector.backend.options && i18n.services.backendConnector.backend.options.loadPath && i18n.services.backendConnector.backend.options.loadPath.indexOf('.locize.') > 0) {
          backendName = 'I18nextLocizeBackend';
        } else {
          backendName = i18n.services.backendConnector.backend ? i18n.services.backendConnector.backend.constructor.name : 'options.resources';
        }
        var opts = {
          backendName: backendName,
          sourceLng: impl.getSourceLng(),
          i18nFormat: i18n.options.compatibilityJSON === 'v3' ? 'i18next_v3' : 'i18next_v4',
          i18nFramework: 'i18next',
          isLocizify: i18n.options.isLocizify,
          defaultNS: i18n.options.defaultNS,
          targetLngs: _toConsumableArray(new Set([].concat(i18n.options.preload, i18n.options.supportedLngs, [impl.getLng()]))).filter(function (l) {
            return l !== 'cimode' && l !== false && l !== 'false' && l !== undefined && l !== impl.getSourceLng();
          }),
          ns: _toConsumableArray(new Set([].concat(i18n.options.ns, i18n.options.fallbackNS, i18n.options.defaultNS))).filter(function (n) {
            return n !== false && n !== 'false';
          })
        };
        if (!i18n.options.backend && !i18n.options.editor) return opts;
        var pickFrom = i18n.options.editor || i18n.options.backend;
        return _objectSpread$1(_objectSpread$1({}, opts), {}, {
          projectId: pickFrom.projectId,
          version: pickFrom.version
        });
      },
      bindLanguageChange: function bindLanguageChange(cb) {
        i18n.on('languageChanged', cb);
      },
      bindMissingKeyHandler: function bindMissingKeyHandler(cb) {
        i18n.options.missingKeyHandler = function (lng, ns, k, val, isUpdate, opts) {
          if (!isUpdate) cb(lng, ns, k, val);
        };
      },
      triggerRerender: function triggerRerender() {
        i18n.emit('editorSaved');
      }
    };
    return impl;
  }

  function getImplementation() {
    var impl = {
      getResource: function getResource(lng, ns, key) {
        return {};
      },
      setResource: function setResource(lng, ns, key, value) {},
      getResourceBundle: function getResourceBundle(lng, ns, cb) {
        cb({});
      },
      getDefaultNS: function getDefaultNS() {},
      getLng: function getLng() {},
      getSourceLng: function getSourceLng() {},
      getLocizeDetails: function getLocizeDetails() {
        return {};
      },
      bindLanguageChange: function bindLanguageChange(cb) {},
      bindMissingKeyHandler: function bindMissingKeyHandler(cb) {},
      triggerRerender: function triggerRerender() {}
    };
    return impl;
  }

  function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
  function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
  var dummyImplementation = getImplementation();
  function start() {
    var implementation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : dummyImplementation;
    var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      show: false,
      qsProp: 'incontext'
    };
    if (typeof document === 'undefined') return;
    var showInContext = opt.show || getQsParameterByName(opt.qsProp || 'incontext') === 'true';
    var scriptEle = document.getElementById('locize');
    var config = {};
    ['projectId', 'version'].forEach(function (attr) {
      if (!scriptEle) return;
      var value = scriptEle.getAttribute(attr.toLowerCase()) || scriptEle.getAttribute('data-' + attr.toLowerCase());
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      if (value !== undefined && value !== null) config[attr] = value;
    });
    config = _objectSpread(_objectSpread(_objectSpread({}, implementation.getLocizeDetails()), config), opt);
    api.config = config;
    api.init(implementation);
    setImplementation(implementation);
    implementation === null || implementation === void 0 || implementation.bindLanguageChange(function (lng) {
      api.sendCurrentTargetLanguage(implementation.getLng());
    });
    function continueToStart() {
      if (!isInIframe && !showInContext) return;
      var observer = createObserver(document.body, function (eles) {
        eles.forEach(function (ele) {
          parseTree(ele);
        });
        api.sendCurrentParsedContent();
      });
      observer.start();
      startMouseTracking(observer);
      if (!isInIframe && !document.getElementById(popupId)) {
        document.body.append(Popup(getIframeUrl(), function () {
          api.requestInitialize(config);
        }));
        initDragElement();
        initResizeElement();
      }
      if (typeof window !== 'undefined') {
        var oldHref = window.document.location.href;
        api.sendHrefchanged(oldHref);
        var bodyList = window.document.querySelector('body');
        var _observer = new window.MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (oldHref !== window.document.location.href) {
              oldHref = window.document.location.href;
              api.sendHrefchanged(oldHref);
            }
          });
        });
        var _config = {
          childList: true,
          subtree: true
        };
        _observer.observe(bodyList, _config);
      }
    }
    if (document.body) return continueToStart();
    if (typeof window !== 'undefined') window.addEventListener('load', function () {
      return continueToStart();
    });
  }

  function configurePostProcessor(i18next, options) {
    i18next.use(SubliminalPostProcessor);
    if (typeof options.postProcess === 'string') {
      options.postProcess = [options.postProcess, 'subliminal'];
    } else if (Array.isArray(options.postProcess)) {
      options.postProcess.push('subliminal');
    } else {
      options.postProcess = 'subliminal';
    }
    options.postProcessPassResolved = true;
  }
  var i18next;
  var locizeEditorPlugin = function locizeEditorPlugin() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    opt.qsProp = opt.qsProp || 'incontext';
    return {
      type: '3rdParty',
      init: function init(i18n) {
        var options = i18n.options;
        i18next = i18n;
        var impl = getImplementation$1(i18n);
        var showInContext = opt.show || getQsParameterByName(opt.qsProp) === 'true';
        if (isInIframe || showInContext) configurePostProcessor(i18next, options);
        start(impl, opt);
      }
    };
  };
  var locizePlugin = locizeEditorPlugin();

  var _excluded = ["implementation"];
  function startStandalone() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var implementation = options.implementation,
      rest = _objectWithoutProperties(options, _excluded);
    start(implementation, Object.keys(rest).length > 0 ? rest : undefined);
  }
  if (typeof window !== 'undefined') {
    window.locizeStartStandalone = startStandalone;
  }

  var index = {
    wrap: wrap,
    unwrap: unwrap,
    containsHiddenMeta: containsHiddenMeta,
    PostProcessor: SubliminalPostProcessor,
    addLocizeSavedHandler: addLocizeSavedHandler,
    locizePlugin: locizePlugin,
    locizeEditorPlugin: locizeEditorPlugin,
    setEditorLng: setEditorLng,
    startStandalone: startStandalone
  };

  exports.PostProcessor = SubliminalPostProcessor;
  exports.addLocizeSavedHandler = addLocizeSavedHandler;
  exports.containsHiddenMeta = containsHiddenMeta;
  exports["default"] = index;
  exports.locizeEditorPlugin = locizeEditorPlugin;
  exports.locizePlugin = locizePlugin;
  exports.setEditorLng = setEditorLng;
  exports.startStandalone = startStandalone;
  exports.unwrap = unwrap;
  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
