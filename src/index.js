import { locizePlugin } from './locizePlugin.js'
import { startStandalone } from './startStandalone.js'
import { addLocizeSavedHandler, turnOn, turnOff, setEditorLng } from './api/index.js'
import { wrap, unwrap, containsHiddenMeta, PostProcessor } from 'i18next-subliminal'

export {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor,
  locizePlugin,
  addLocizeSavedHandler,
  turnOn,
  turnOff,
  setEditorLng,
  startStandalone
}

export default {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor,
  addLocizeSavedHandler,
  locizePlugin,
  turnOn,
  turnOff,
  setEditorLng,
  startStandalone
}
