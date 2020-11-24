import { createClickHandler } from './clickHandler';

let source;
let origin;
let handler;
let clickInterceptionEnabled;
let handleLocizeSaved;
// let i18next;

export function addLocizeSavedHandler(hnd) {
  handleLocizeSaved = hnd;
}

export function onAddedKey(lng, ns, key, value) {
  if (source) {
    source.postMessage({
      message: 'added', lng, ns, key, value
    }, origin);
  }
}

export const locizePlugin = {
  type: '3rdParty',

  init(i18n) {
    // i18next = i18n;

    addLocizeSavedHandler((res) => {
      res.updated.forEach((item) => {
        const {
          lng, ns, key, data
        } = item;
        i18n.addResource(lng, ns, key, data.value, { silent: true });
        i18n.emit('editorSaved');
      });
    });

    i18n.options.missingKeyHandler = (lng, ns, k, val, isUpdate, opts) => {
      if (!isUpdate) onAddedKey(lng, ns, k, val);
    };
  }
};

window.addEventListener('message', (e) => {
  if (e.data.message === 'isLocizeEnabled') {
    // console.warn("result: ", ev.data);
    // parent => ev.source;
    if (!source) {
      source = e.source;
      origin = e.origin;
      handler = createClickHandler((payload) => {
        source.postMessage({ message: 'clickedElement', payload }, origin);
      });
      // document.body.addEventListener('click', handler, true);
      // clickInterceptionEnabled = true;
    }

    source.postMessage({ message: 'locizeIsEnabled', enabled: true }, e.origin);
  } else if (e.data.message === 'turnOn') {
    if (!clickInterceptionEnabled) window.document.body.addEventListener('click', handler, true);
    clickInterceptionEnabled = true;
    source.postMessage({ message: 'turnedOn' }, origin);
  } else if (e.data.message === 'turnOff') {
    if (clickInterceptionEnabled) window.document.body.removeEventListener('click', handler, true);
    clickInterceptionEnabled = false;
    source.postMessage({ message: 'turnedOff' }, origin);
  } else if (e.data.message === 'committed') {
    const data = e.data.payload;
    if (window.locizeSavedHandler) window.locizeSavedHandler(data);
    if (handleLocizeSaved) handleLocizeSaved(data);
  }
});
