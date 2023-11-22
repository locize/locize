import { api } from './postMessage.js'

function handler (payload) {
  const { lng, ns, ...rest } = payload

  api.i18n.getResourceBundle(lng, ns, resources => {
    api.confirmResourceBundle({ resources, lng, ns, ...rest })
  })
}

api.addHandler('requestResourceBundle', handler)
