import { debounce } from './utils.js'
import { validAttributes } from './vars.js'

function ignoreMutation (ele) {
  const ret =
    ele.dataset &&
    (ele.dataset.i18nextEditorElement === 'true' ||
      ele.dataset.locizeEditorIgnore === 'true')

  if (!ret && ele.parentElement) return ignoreMutation(ele.parentElement)

  return ret
}

export function createObserver (ele, handle) {
  // enable some skip for internal mutations
  let internalChange
  let lastToggleTimeout
  const toggleInternal = () => {
    if (lastToggleTimeout) clearTimeout(lastToggleTimeout)

    lastToggleTimeout = setTimeout(() => {
      if (internalChange) internalChange = false
    }, 200)
  }

  // hold elements with mutations
  let targetEles = []
  const debouncedHandler = debounce(function h () {
    handle(targetEles)
    targetEles = []
  }, 100)

  // eslint-disable-next-line no-undef
  const observer = new MutationObserver(mutations => {
    if (internalChange) {
      toggleInternal()
      return
    }

    // check if mutation is relevant
    let triggerMutation = false

    // store most outer element for mutation
    mutations.forEach(function (mutation) {
      // ignore, eg. we're not interested in style changes
      if (
        mutation.type === 'attributes' &&
        !validAttributes.includes(mutation.attributeName)
      ) {
        return
      }

      // ignore mutation done by our elements
      if (mutation.type === 'childList') {
        let notOurs = 0

        if (!ignoreMutation(mutation.target)) {
          mutation.addedNodes.forEach(n => {
            if (ignoreMutation(n)) return
            notOurs = notOurs + 1
          }, 0)

          mutation.removedNodes.forEach(n => {
            if (ignoreMutation(n)) return
            notOurs = notOurs + 1
          }, 0)
        }

        if (notOurs === 0) return
      }

      // eventual text relevant mutation
      triggerMutation = true

      // test if mutated element is already part of another mutation
      const includedAlready = targetEles.reduce((mem, element) => {
        if (
          mem ||
          element.contains(mutation.target) ||
          !mutation.target.parentElement
        )
          return true
        return false
      }, false)

      // if not remove elements contained in this mutation element
      // and add it
      if (!includedAlready) {
        targetEles = targetEles.filter(
          element => !mutation.target.contains(element)
        )
        targetEles.push(mutation.target)
      }

      // console.log('MUTATION', mutation.type, mutation)
    })

    // trigger handle
    if (triggerMutation) debouncedHandler()
  })

  return {
    start: (
      observerConfig = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      }
    ) => {
      observer.observe(ele, observerConfig)
    },
    skipNext () {
      internalChange = true
    }
  }
}
