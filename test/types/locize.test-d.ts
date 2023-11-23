import { expectType } from 'tsd'
import i18next from 'i18next'
import {
  turnOn,
  turnOff,
  locizePlugin,
  locizeEditorPlugin,
  LocizePlugin,
  setEditorLng,
  addLocizeSavedHandler,
  wrap,
  unwrap,
  containsHiddenMeta,
  PostProcessor,
  startStandalone
} from '../../index'

expectType<void>(turnOn())
expectType<void>(turnOff())
expectType<LocizePlugin>(locizePlugin)
expectType<LocizePlugin>(locizeEditorPlugin())
expectType<void>(setEditorLng('en'))
expectType<void>(addLocizeSavedHandler((data) => {}))

expectType<string>(wrap('text', { key: 'some.key' }))
expectType<string>(unwrap('text'))
expectType<boolean>(containsHiddenMeta('text'))

i18next.use(PostProcessor).init()

expectType<void>(startStandalone())
