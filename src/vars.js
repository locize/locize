export const validAttributes = ['placeholder', 'title', 'alt']
export const ignoreElements = ['SCRIPT']
export const colors = {
  highlight: '#1976d2',
  warning: '#e67a00',
  gray: '#ccc'
}

export const getIframeUrl = () => {
  let p
  if (typeof process !== 'undefined') p = process
  if (!p && typeof window !== 'undefined') p = window.process
  const prc = p || {}
  const env = prc.env?.locizeIncontext || 'production'
  return env === 'development'
    ? 'http://localhost:3003/'
    : env === 'staging'
      ? 'https://incontext-dev.locize.app'
      : 'https://incontext.locize.app'
}
