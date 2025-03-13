import { locizePlugin, locizeEditorPlugin } from './locizePlugin.js'
import { startStandalone } from './_startStandalone.js'
import {
  addLocizeSavedHandler,
  turnOn,
  turnOff,
  setEditorLng
} from './api/index.js'
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
  locizeEditorPlugin,
  // turnOn,
  // turnOff,
  setEditorLng,
  startStandalone
}
