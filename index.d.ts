export * from 'i18next-subliminal'

/**
 * The i18next plugin for the locize incontext editor.
 */
export interface LocizePlugin {
  type: '3rdParty'
  init(i18next: any): () => void
}

/**
 * Project details the implementation reports back to the editor at
 * handshake time so the editor knows which Locize project + version +
 * namespaces are in play. All fields are optional because not every
 * host i18n framework exposes the same metadata.
 */
export interface LocizeDetails {
  projectId?: string
  version?: string
  backendName?: string
  sourceLng?: string
  i18nFormat?: string
  i18nFramework?: string
  isLocizify?: boolean
  defaultNS?: string
  ns?: string[]
  targetLngs?: string[]
}

/**
 * The implementation surface that `startStandalone({ implementation })`
 * expects. Mirrors what the bundled i18next / vue-i18n / dummy
 * adapters provide.
 *
 * Methods are typed as optional because the runtime in `process.js`
 * already guards each call with optional chaining — a partial impl
 * that only fills in `getLng` + `bindLanguageChange` works for the
 * basic editor flow even if the resource accessors are no-ops.
 */
export interface Implementation {
  getResource?(lng: string, ns: string, key: string): unknown
  setResource?(lng: string, ns: string, key: string, value: unknown): void
  getResourceBundle?(lng: string, ns: string, cb: (data: unknown) => void): void
  getDefaultNS?(): string | undefined
  getLng?(): string | undefined
  getSourceLng?(): string | undefined
  getLocizeDetails?(): LocizeDetails
  bindLanguageChange?(cb: (lng: string) => void): void
  bindMissingKeyHandler?(cb: (lng: string, ns: string, key: string, value: unknown) => void): void
  triggerRerender?(): void
}

/**
 * Returns an i18next plugin that will show the incontext editor only if your url contains the query paramenter ?incontext=true.
 */
export const locizePlugin: LocizePlugin

/**
 * Returns an i18next plugin that will only show the incontext editor if the qsProp in your url is set to true or if you pass { show: true }.
 * @param opt defaults to: { qsProp: 'incontext', show: false }
 */
export function locizeEditorPlugin(opt?: {
  qsProp?: string
  show?: boolean
  projectId?: string
  version?: string
}): LocizePlugin

/**
 * Set the language for the editor.
 */
export function setEditorLng(lng: string): void

/**
 * To load the translations somewhere.
 */
export function addLocizeSavedHandler(fn: (data: any) => void): void

/**
 * If used without i18next.
 *
 * Pass `implementation` when wiring up a non-i18next host (e.g.
 * vue-i18n via `getVueI18nImplementation`).
 */
export function startStandalone(opt?: {
  qsProp?: string
  show?: boolean
  projectId?: string
  version?: string
  implementation?: Implementation
}): void

/**
 * Options accepted by `getVueI18nImplementation`. Locize project
 * metadata (projectId / version / namespaces) can't be inferred from
 * vue-i18n state and must be passed explicitly. `watch` is Vue's
 * `watch` function — supply it to enable the editor's language-
 * change observation; omit to make `bindLanguageChange` a no-op
 * (keeps the `locize` package free of a `vue` peer dep).
 */
export interface VueI18nImplementationOptions {
  projectId?: string
  version?: string
  sourceLng?: string
  defaultNS?: string
  ns?: string[]
  targetLngs?: string[]
  backendName?: string
  watch?: (getter: () => any, cb: (val: any) => void) => any
}

/**
 * Build an `Implementation` for a vue-i18n composer (composition API
 * mode). Pass the result to `startStandalone({ implementation })` to
 * wire the InContext editor onto a vue-i18n host.
 *
 * @example
 *   import { startStandalone, getVueI18nImplementation } from 'locize'
 *   import { useI18n } from 'vue-i18n'
 *   import { watch } from 'vue'
 *
 *   const i18n = useI18n({ useScope: 'global' })
 *   const impl = getVueI18nImplementation(i18n, {
 *     projectId: '<your-project-id>',
 *     version: 'latest',
 *     ns: ['common'],
 *     watch,
 *   })
 *   startStandalone({ implementation: impl, show: true })
 */
export function getVueI18nImplementation(
  i18n: any,
  options?: VueI18nImplementationOptions
): Implementation
