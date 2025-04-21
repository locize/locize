export * from 'i18next-subliminal'

/**
 * The i18next plugin for the locize incontext editor.
 */
export interface LocizePlugin {
  type: '3rdParty'
  init(i18next: any): () => void
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
 */
export function startStandalone(opt?: {
  qsProp?: string
  show?: boolean
  projectId?: string
  version?: string
}): void
