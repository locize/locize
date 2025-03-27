export function getImplementation () {
  const impl = {
    getResource: (lng, ns, key) => {
      return {}
    },
    setResource: (lng, ns, key, value) => {

    },
    getResourceBundle: (lng, ns, cb) => {
      // eslint-disable-next-line n/no-callback-literal
      cb({})
    },
    getDefaultNS: () => {

    },
    getLng: () => {

    },
    getSourceLng: () => {

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
