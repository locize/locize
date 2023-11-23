export * from 'i18next-subliminal'

/**
 * The i18next plugin for the locize incontext editor.
 */
export interface LocizePlugin {
  type: '3rdParty';
  init(i18next: any): () => void;
}

/**
 * Returns an i18next plugin that will show the incontext editor.
 */
export const locizePlugin: LocizePlugin

/**
 * Returns an i18next plugin that will only show the incontext editor if the qsProp in your url is set to true.
 * @param opt defaults to: { qsProp: 'incontext' }
 */
export function locizeEditorPlugin(opt?: { qsProp?: string }): LocizePlugin

/**
 * Turn on programmatically.
 */
export function turnOn(): void;

/**
 * Turn off programmatically.
 */
export function turnOff(): void;

/**
 * Set the language for the editor.
 */
export function setEditorLng(lng: string): void;

/**
 * To load the translations somewhere.
 */
export function addLocizeSavedHandler(fn: (data: any) => void): void;

/**
 * If used without i18next.
 */
export function startStandalone(): void;
