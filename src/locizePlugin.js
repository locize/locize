import { PostProcessor, unwrap } from 'i18next-subliminal'
import { start } from './process.js'
import { startLegacy } from './processLegacy.js'

let isInIframe = typeof window !== 'undefined'
try {
  // eslint-disable-next-line no-undef, no-restricted-globals
  isInIframe = self !== top
  // eslint-disable-next-line no-empty
} catch (e) {}

let i18next
export const locizePlugin = {
  type: '3rdParty',

  init (i18n) {
    const { options } = i18n

    // store for later
    i18next = i18n

    // add postProcessor and needed options now
    if (!isInIframe) {
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

    const impl = {
      getResource: (lng, ns, key) => {
        return i18n.getResource(lng, ns, key)
      },
      setResource: (lng, ns, key, value) => {
        return i18n.addResource(lng, ns, key, value, { silent: true })
      },
      getResourceBundle: (lng, ns, cb) => {
        i18n.loadNamespaces(ns, () => {
          cb(i18n.getResourceBundle(lng, ns))
        })
      },
      getLng: () => {
        return i18n.languages[0]
      },
      getSourceLng: () => {
        const fallback = i18n.options.fallbackLng
        if (typeof fallback === 'string') return fallback
        if (Array.isArray(fallback)) return fallback[fallback.length - 1]

        if (fallback && fallback.default) {
          if (typeof fallback.default === 'string') return fallback
          if (Array.isArray(fallback.default)) return fallback.default[fallback.default.length - 1]
        }

        if (typeof fallback === 'function') {
          const res = fallback(i18n.resolvedLanguage)
          if (typeof res === 'string') return res
          if (Array.isArray(res)) return res[res.length - 1]
        }

        return 'dev'
      },
      getLocizeDetails: () => {
        let backendName
        if (i18n.services.backendConnector.backend && i18n.services.backendConnector.backend.options && i18n.services.backendConnector.backend.options.loadPath && i18n.services.backendConnector.backend.options.loadPath.indexOf('.locize.') > 0) {
          backendName = 'I18NextLocizeBackend'
        } else {
          backendName = i18n.services.backendConnector.backend
            ? i18n.services.backendConnector.backend.constructor.name
            : 'options.resources'
        }

        const opts = {
          backendName,
          sourceLng: impl.getSourceLng(),
          i18nFormat: i18n.options.compatibilityJSON === 'v3' ? 'i18next_v3' : 'i18next_v4',
          i18nFramework: 'i18next',
          isLocizify: i18n.options.isLocizify,
          defaultNS: i18n.options.defaultNS
        }

        if (!i18n.options.backend && !i18n.options.editor) return opts
        const pickFrom = i18n.options.backend || i18n.options.editor
        return {
          ...opts,
          projectId: pickFrom.projectId,
          version: pickFrom.version
        }
      },
      bindLanguageChange: cb => {
        i18n.on('languageChanged', cb)
      },
      bindMissingKeyHandler: cb => {
        i18n.options.missingKeyHandler = (lng, ns, k, val, isUpdate, opts) => {
          if (!isUpdate) cb(lng, ns, k, val)
        }
      },
      triggerRerender: () => {
        i18n.emit('editorSaved')
      }
    }

    // start process and expose some implementation functions
    if (!isInIframe) {
      start(impl)
    } else {
      startLegacy(impl)
    }
  }
}
export { unwrap }

export function getI18next () {
  return i18next
}
