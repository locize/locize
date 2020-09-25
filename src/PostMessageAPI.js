import { createClickHandler } from './clickHandler'

let source;
let origin;
let handler;
let clickInterceptionEnabled;
let handleLocizeSaved;

export function addLocizeSavedHandler(handler) {
  handleLocizeSaved = handler;
}

if (!window.locizeBoundPostMessageAPI) {
  window.addEventListener('message', e => {
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
      if (!clickInterceptionEnabled) document.body.addEventListener('click', handler, true);
      clickInterceptionEnabled = true;
      source.postMessage({ message: 'turnedOn' }, origin);
    } else if (e.data.message === 'turnOff') {
      if (clickInterceptionEnabled) document.body.removeEventListener('click', handler, true);
      clickInterceptionEnabled = false;
      source.postMessage({ message: 'turnedOff' }, origin);
    } else if (e.data.message === 'committed') {
      const data = e.data.payload;
      if (window.locizeSavedHandler) window.locizeSavedHandler(data);
      if (handleLocizeSaved) handleLocizeSaved(data);
    }
  });
  window.locizeBoundPostMessageAPI = true;
}
