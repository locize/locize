import { startLegacy } from './_processLegacy.js'

export function startStandalone () {
  startLegacy({
    getLocizeDetails: () => {
      return {}
    },
    getLng: () => {
      return undefined
    },
    setResource: () => {},
    triggerRerender: () => {},
    getResourceBundle: () => {
      return {}
    },
    bindMissingKeyHandler: () => {},
    bindLanguageChange: () => {}
  })
}

if (typeof window !== 'undefined') { window.locizeStartStandalone = startStandalone }
