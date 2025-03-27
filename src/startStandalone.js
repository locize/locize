import { start } from './process.js'

export function startStandalone (options = {}) {
  const { implementation, ...rest } = options
  start(implementation, Object.keys(rest).length > 0 ? rest : undefined)
}

if (typeof window !== 'undefined') { window.locizeStartStandalone = startStandalone }
