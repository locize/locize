/* eslint-disable semi */
export interface LocizePlugin {
  type: '3rdParty';
  init(i18next: any): () => void;
}

export const locizePlugin: LocizePlugin;

export function turnOn(): void;
export function turnOff(): void;

export function setEditorLng(lng: string): void;

export function showLocizeLink(opt?: { projectId?: string, version?: string }): void;

export function addLocizeSavedHandler(fn: (data: any) => void): void;
