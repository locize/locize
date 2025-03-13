export function getImplementation () {
  const impl = {
    getResource: (lng, ns, key) => {
      return {}
    },
    setResource: (lng, ns, key, value) => {
      return
    },
    getResourceBundle: (lng, ns, cb) => {
      cb({})
    },
    getDefaultNS: () => {
      return
    },
    getLng: () => {
      return
    },
    getSourceLng: () => {
      return
    },
    getLocizeDetails: () => {
      return {}
    },
    bindLanguageChange: cb => {},
    bindMissingKeyHandler: cb => {},
    triggerRerender: () => {}
  }
  return impl
}
