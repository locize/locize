import { locizePlugin, locizeEditorPlugin } from './locizePlugin.js'
import { startStandalone } from './startStandalone.js'
import { addLocizeSavedHandler, setEditorLng } from './api/index.js'
import {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor
} from 'i18next-subliminal'

export {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor,
  locizePlugin,
  locizeEditorPlugin,
  addLocizeSavedHandler,
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
  locizeEditorPlugin,
  setEditorLng,
  startStandalone
}
