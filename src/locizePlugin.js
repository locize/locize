import { PostProcessor, unwrap } from 'i18next-subliminal'
import { start } from './process.js'
import { isInIframe, getQsParameterByName } from './utils.js'
import * as implementations from './implementations/index.js'

function configurePostProcessor (i18next, options) {
  i18next.use(PostProcessor)

  if (typeof options.postProcess === 'string') {
    options.postProcess = [options.postProcess, 'subliminal']
  } else if (Array.isArray(options.postProcess)) {
    options.postProcess.push('subliminal')
  } else {
    options.postProcess = 'subliminal'
  }

  options.postProcessPassResolved = true
}

// function getImplementation (i18n) {
//   const impl = {
//     getResource: (lng, ns, key) => {
//       return i18n.getResource && i18n.getResource(lng, ns, key)
//     },
//     setResource: (lng, ns, key, value) => {
//       return i18n.addResource(lng, ns, key, value, { silent: true })
//     },
//     getResourceBundle: (lng, ns, cb) => {
//       i18n.loadNamespaces(ns, () => {
//         cb(i18n.getResourceBundle(lng, ns))
//       })
//     },
//     getDefaultNS: () => {
//       return i18n.options.defaultNS
//     },
//     getLng: () => {
//       return (
//         i18n.resolvedLanguage ||
//         (i18n.languages && i18n.languages[0]) ||
//         i18n.options.lng
//       )
//     },
//     getSourceLng: () => {
//       const fallback = i18n.options.fallbackLng
//       if (typeof fallback === 'string') return fallback
//       if (Array.isArray(fallback)) return fallback[fallback.length - 1]

//       if (fallback && fallback.default) {
//         if (typeof fallback.default === 'string') return fallback
//         if (Array.isArray(fallback.default))
//           return fallback.default[fallback.default.length - 1]
//       }

//       if (typeof fallback === 'function') {
//         const res = fallback(i18n.resolvedLanguage)
//         if (typeof res === 'string') return res
//         if (Array.isArray(res)) return res[res.length - 1]
//       }

//       return 'dev'
//     },
//     getLocizeDetails: () => {
//       let backendName
//       if (
//         i18n.services.backendConnector.backend &&
//         i18n.services.backendConnector.backend.options &&
//         i18n.services.backendConnector.backend.options.loadPath &&
//         i18n.services.backendConnector.backend.options.loadPath.indexOf(
//           '.locize.'
//         ) > 0
//       ) {
//         backendName = 'I18nextLocizeBackend'
//       } else {
//         backendName = i18n.services.backendConnector.backend
//           ? i18n.services.backendConnector.backend.constructor.name
//           : 'options.resources'
//       }

//       const opts = {
//         backendName,
//         sourceLng: impl.getSourceLng(),
//         i18nFormat:
//           i18n.options.compatibilityJSON === 'v3' ? 'i18next_v3' : 'i18next_v4',
//         i18nFramework: 'i18next',
//         isLocizify: i18n.options.isLocizify,
//         defaultNS: i18n.options.defaultNS,
//         targetLngs: [
//           ...new Set(
//             [].concat(i18n.options.preload, i18n.options.supportedLngs, [
//               impl.getLng()
//             ])
//           )
//         ].filter(
//           l =>
//             l !== 'cimode' &&
//             l !== false &&
//             l !== 'false' &&
//             l !== undefined &&
//             l !== impl.getSourceLng()
//         ),
//         ns: [
//           ...new Set(
//             [].concat(
//               i18n.options.ns,
//               i18n.options.fallbackNS,
//               i18n.options.defaultNS
//             )
//           )
//         ].filter(n => n !== false && n !== 'false')
//       }

//       if (!i18n.options.backend && !i18n.options.editor) return opts
//       const pickFrom = i18n.options.editor || i18n.options.backend
//       return {
//         ...opts,
//         projectId: pickFrom.projectId,
//         version: pickFrom.version
//       }
//     },
//     bindLanguageChange: cb => {
//       i18n.on('languageChanged', cb)
//     },
//     bindMissingKeyHandler: cb => {
//       i18n.options.missingKeyHandler = (lng, ns, k, val, isUpdate, opts) => {
//         if (!isUpdate) cb(lng, ns, k, val)
//       }
//     },
//     triggerRerender: () => {
//       i18n.emit('editorSaved')
//     }
//   }
//   return impl
// }

let i18next
export const locizeEditorPlugin = (opt = {}) => {
  opt.qsProp = opt.qsProp || 'incontext'

  return {
    type: '3rdParty',

    init (i18n) {
      const { options } = i18n

      // store for later
      i18next = i18n

      const impl = implementations.i18next.getImplementation(i18n)

      const showInContext = opt.show || getQsParameterByName(opt.qsProp) === 'true'

      // do only manipulate html if incontext popup is shown or if website is rendered in iframe in incontext view of locize ui.
      if (isInIframe || showInContext) configurePostProcessor(i18next, options)

      start(impl, opt) // we no longer show the legacy process but use the new way without popup opening
    }
  }
}
export const locizePlugin = locizeEditorPlugin()

export { unwrap }

export function getI18next () {
  return i18next
}
