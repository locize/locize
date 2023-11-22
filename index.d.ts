export * from 'i18next-subliminal'

export interface LocizePlugin {
  type: '3rdParty';
  init(i18next: any): () => void;
}

export const locizePlugin: LocizePlugin

export function turnOn(): void;
export function turnOff(): void;
export function setEditorLng(lng: string): void;
export function addLocizeSavedHandler(fn: (data: any) => void): void;

export function startStandalone(): void;
