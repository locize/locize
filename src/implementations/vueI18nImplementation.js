/**
 * Locize "implementation" surface for vue-i18n (composition API).
 *
 * Mirrors `i18nextImplementation.js` for the equivalent vue-i18n
 * composer API. Accepts the composer — typically the global one, e.g.
 * `useI18n({ useScope: 'global' })` or `nuxtApp.$i18n` under
 * `@nuxtjs/i18n` — plus the Locize project details that can't be
 * inferred from vue-i18n state (`projectId`, `version`, namespaces,
 * etc.). Pass the result to `startStandalone({ implementation })`.
 *
 * Why this lives here: the InContext editor needs a small, uniform
 * surface to read/write resources, get the current language, and
 * observe missing keys, regardless of the host i18n framework. The
 * i18next adapter ships in the same directory; this is the equivalent
 * for vue-i18n. Anything Locize-backend-shaped (saveMissing POSTs,
 * CDN fetches) deliberately stays in caller code — that's a separate
 * concern from the editor implementation surface.
 *
 * @param {*} i18n - The vue-i18n composer (composition API mode).
 * @param {Object} [options]
 * @param {string} [options.projectId]            Locize project id.
 * @param {string} [options.version='latest']     Locize version label.
 * @param {string} [options.sourceLng='en']       Source / reference language.
 * @param {string} [options.defaultNS='common']   Default namespace; also used
 *                                                as the namespace fallback for
 *                                                keys without a dotted prefix.
 * @param {string[]} [options.ns]                 All namespaces this project uses.
 * @param {string[]} [options.targetLngs]         Non-source languages to expose
 *                                                in the editor's language picker.
 * @param {string} [options.backendName]          Free-form label sent to the
 *                                                editor so it can show which
 *                                                backend is in play (e.g.
 *                                                'locize-cli', 'http-backend').
 * @param {Function} [options.watch]              Vue's `watch` function
 *                                                (`import { watch } from 'vue'`).
 *                                                Required if you want the editor
 *                                                to be notified when the user
 *                                                changes language. Without it
 *                                                `bindLanguageChange` is a
 *                                                no-op.
 */
export function getImplementation (i18n, options = {}) {
  const sourceLng = options.sourceLng || 'en'
  const defaultNS = options.defaultNS || 'common'

  // Composer's `locale` is a Vue ref in composition API mode and a plain
  // string in legacy mode. Read both shapes.
  const readLocale = () => {
    if (i18n.locale && typeof i18n.locale === 'object' && 'value' in i18n.locale) {
      return i18n.locale.value
    }
    return i18n.locale
  }

  const impl = {
    getResource: (lng, ns, key) => {
      const msgs = i18n.getLocaleMessage(lng) || {}
      return msgs[ns] && msgs[ns][key]
    },

    setResource: (lng, ns, key, value) => {
      i18n.mergeLocaleMessage(lng, { [ns]: { [key]: value } })
    },

    getResourceBundle: (lng, ns, cb) => {
      // vue-i18n's getLocaleMessage is synchronous; it assumes the
      // locale messages are already loaded. With `@nuxtjs/i18n`'s
      // `lazy: true`, the caller must ensure the locale was preloaded
      // (or use the editor only after the language is active).
      const msgs = i18n.getLocaleMessage(lng) || {}
      // eslint-disable-next-line n/no-callback-literal
      cb(msgs[ns] || {})
    },

    getDefaultNS: () => defaultNS,

    getLng: readLocale,

    getSourceLng: () => sourceLng,

    getLocizeDetails: () => ({
      projectId: options.projectId,
      version: options.version || 'latest',
      backendName: options.backendName,
      sourceLng,
      i18nFormat: 'vuei18n',
      i18nFramework: 'vue-i18n',
      defaultNS,
      ns: options.ns || [defaultNS],
      targetLngs: (options.targetLngs || []).filter(l => l !== sourceLng)
    }),

    bindLanguageChange: cb => {
      // vue-i18n's composer locale is a Vue ref; observing it requires
      // Vue's reactivity. To keep `locize` framework-agnostic we don't
      // import `vue` here — instead callers pass Vue's `watch` via
      // `options.watch`. Without it, this is a no-op (the editor will
      // miss language switches; users can refresh the editor manually).
      if (typeof options.watch !== 'function') return
      options.watch(readLocale, lng => {
        try { cb(lng) } catch (_) { /* swallow */ }
      })
    },

    bindMissingKeyHandler: cb => {
      // Chain onto any existing `missing` handler so we observe missing
      // keys without clobbering a caller's handler (e.g. a saveMissing
      // POST). Dotted keys are split on the first `.` so the first
      // segment becomes the namespace — matching vue-i18n's nested-key
      // lookup convention.
      const prev = i18n.missing
      i18n.missing = (locale, key, vm, values) => {
        const dot = key.indexOf('.')
        const ns = dot >= 0 ? key.slice(0, dot) : defaultNS
        const actualKey = dot >= 0 ? key.slice(dot + 1) : key
        try { cb(locale, ns, actualKey, key) } catch (_) { /* swallow */ }
        if (typeof prev === 'function') return prev(locale, key, vm, values)
      }
    },

    triggerRerender: () => {
      // Re-assign the current locale's messages back to itself to nudge
      // Vue's reactivity into re-evaluating every t() output. The
      // editor calls this after a save so the live page reflects the
      // edited string immediately.
      const lng = readLocale()
      const msgs = i18n.getLocaleMessage(lng) || {}
      i18n.setLocaleMessage(lng, Object.assign({}, msgs))
    }
  }

  return impl
}
