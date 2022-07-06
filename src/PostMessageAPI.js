import { createClickHandler } from './clickHandler';
import { initUI } from './ui';

let isInIframe = true;
try {
  // eslint-disable-next-line no-undef, no-restricted-globals
  isInIframe = self !== top;
  // eslint-disable-next-line no-empty
} catch (e) {}
let source;
let origin;
let handler;
let clickInterceptionEnabled;
let handleLocizeSaved;
let scriptTurnedOff; // used to flag turnOff by developers using the exported functions -> disable the editor function by code
let pendingMsgs = [];

export function addLocizeSavedHandler(hnd) {
  handleLocizeSaved = hnd;
}

export function setEditorLng(lng) {
  const msg = { message: 'setLng', lng };
  if (source) {
    source.postMessage(msg, origin);
  } else {
    pendingMsgs.push(msg);
  }
}

export function onAddedKey(lng, ns, key, value) {
  const msg = {
    message: 'added',
    lng,
    ns,
    key,
    value
  };
  if (source) {
    source.postMessage(msg, origin);
  } else {
    pendingMsgs.push(msg);
  }
}

let i18next;
export const locizePlugin = {
  type: '3rdParty',

  init(i18n) {
    i18next = i18n;

    addLocizeSavedHandler((res) => {
      res.updated.forEach((item) => {
        const {
          lng, ns, key, data
        } = item;
        i18n.addResource(lng, ns, key, data.value, { silent: true });
        i18n.emit('editorSaved');
      });
    });

    if (isInIframe) {
      i18n.options.missingKeyHandler = (lng, ns, k, val, isUpdate, opts) => {
        if (!isUpdate) onAddedKey(lng, ns, k, val);
      };
    }

    i18next.on('languageChanged', (lng) => {
      setEditorLng(lng);
    });
  }
};

function getI18next() {
  return i18next;
}

export function showLocizeLink(options = {}) {
  if (!isInIframe) initUI({ ...options, getI18next });
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line consistent-return
  window.addEventListener('message', (e) => {
    if (e.data.message === 'isLocizeEnabled') {
      // console.warn("result: ", ev.data);
      // parent => ev.source;
      if (!source) {
        source = e.source;
        origin = e.origin;
        handler = createClickHandler(
          (payload) => {
            source.postMessage({ message: 'clickedElement', payload }, origin);
          },
          { getI18next }
        );
        // document.body.addEventListener('click', handler, true);
        // clickInterceptionEnabled = true;
      }

      source.postMessage(
        { message: 'locizeIsEnabled', enabled: true },
        e.origin
      );
      pendingMsgs.forEach((m) => {
        source.postMessage(m, e.origin);
      });
      pendingMsgs = [];
    } else if (e.data.message === 'turnOn') {
      if (scriptTurnedOff) return source.postMessage({ message: 'forcedOff' }, origin);

      if (!clickInterceptionEnabled) window.document.body.addEventListener('click', handler, true);
      clickInterceptionEnabled = true;
      source.postMessage({ message: 'turnedOn' }, origin);
    } else if (e.data.message === 'turnOff') {
      if (scriptTurnedOff) return source.postMessage({ message: 'forcedOff' }, origin);

      if (clickInterceptionEnabled) window.document.body.removeEventListener('click', handler, true);
      clickInterceptionEnabled = false;
      source.postMessage({ message: 'turnedOff' }, origin);
    } else if (e.data.message === 'committed') {
      const data = e.data.payload;
      if (window.locizeSavedHandler) window.locizeSavedHandler(data);
      if (handleLocizeSaved) handleLocizeSaved(data);
    }
  });
}

export function turnOn() {
  scriptTurnedOff = false;

  if (!clickInterceptionEnabled) window.document.body.addEventListener('click', handler, true);
  clickInterceptionEnabled = true;

  if (source) source.postMessage({ message: 'turnedOn' }, origin);
  return scriptTurnedOff;
}

export function turnOff() {
  scriptTurnedOff = true;

  if (clickInterceptionEnabled) window.document.body.removeEventListener('click', handler, true);
  clickInterceptionEnabled = false;

  if (source) source.postMessage({ message: 'turnedOff' }, origin);
  if (source) source.postMessage({ message: 'forcedOff' }, origin);
  return scriptTurnedOff;
}

let oldHref = window.document.location.href;
window.addEventListener('load', () => {
  const bodyList = window.document.querySelector('body');

  const observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (oldHref !== window.document.location.href) {
        // console.warn('url changed', oldHref, document.location.href);
        oldHref = window.document.location.href;

        if (source) source.postMessage({ message: 'hrefChanged', href: oldHref }, origin);
      }
    });
  });

  const config = {
    childList: true,
    subtree: true
  };

  observer.observe(bodyList, config);
});
