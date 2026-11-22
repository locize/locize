import { locizePlugin, locizeEditorPlugin } from './locizePlugin.js'
import { startStandalone } from './startStandalone.js'
import { api, addLocizeSavedHandler, setEditorLng } from './api/index.js'
import { getImplementation as getVueI18nImplementation } from './implementations/vueI18nImplementation.js'
import { isInContextRequested } from './utils.js'
import {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor
} from 'i18next-subliminal'

// programmatic navigate-vs-edit toggle (same as the editor's pause/play)
export function turnOn () {
  api.turnOn()
}
export function turnOff () {
  api.turnOff()
}

export {
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor,
  locizePlugin,
  locizeEditorPlugin,
  addLocizeSavedHandler,
  setEditorLng,
  startStandalone,
  getVueI18nImplementation,
  isInContextRequested
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
  startStandalone,
  getVueI18nImplementation,
  isInContextRequested,
  turnOn,
  turnOff
}
