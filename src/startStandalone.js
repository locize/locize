import { start } from './process.js'

export function startStandalone (options) {
  const { implementation, ...rest } = options
  start(implementation, rest)
}

if (typeof window !== 'undefined')
  window.locizeStartStandalone = startStandalone
