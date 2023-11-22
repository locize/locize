import { startLegacy } from './processLegacy.js'

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
    }
  })
}

if (typeof window !== 'undefined') window.locizeStartStandalone = startStandalone
