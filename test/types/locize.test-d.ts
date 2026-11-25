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
  unwrapAll,
  containsHiddenMeta,
  PostProcessor,
  startStandalone,
  isInContextRequested
} from '../../index'

expectType<void>(turnOn())
expectType<void>(turnOff())
expectType<LocizePlugin>(locizePlugin)
expectType<LocizePlugin>(locizeEditorPlugin())
expectType<LocizePlugin>(locizeEditorPlugin({ ribbonPosition: 'bottom-left' }))
expectType<LocizePlugin>(locizeEditorPlugin({ shadowDOM: true }))
expectType<void>(setEditorLng('en'))
expectType<void>(addLocizeSavedHandler((data) => {}))

expectType<string>(wrap('text', { key: 'some.key' }))
expectType<string>(unwrap('text').text)
expectType<string | undefined>(unwrapAll('text')[0]?.invisibleMeta?.key)
expectType<boolean>(containsHiddenMeta('text'))

i18next.use(PostProcessor).init()

expectType<void>(startStandalone())
expectType<void>(startStandalone({ ribbonPosition: 'bottom-right' }))
expectType<void>(startStandalone({ shadowDOM: true }))

expectType<boolean>(isInContextRequested())
expectType<boolean>(isInContextRequested('myParam'))
