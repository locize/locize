import { colors } from '../vars.js'
import { RibbonBox } from './elements/ribbonBox.js'
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom'

const eleToOutline = [
  'DIV',
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'OL',
  'UL',
  'ADDRESS',
  'BLOCKQUOTE',
  'DL',
  'PRE'
]
const overriddenStyles = ['outline', 'border-radius', 'outline-offset', 'filter']
const originalStyles = {}
const selected = {}

export function highlight (item, node, keys) {
  const { id } = item

  if (selected[id]) return

  if (!originalStyles[id]) {
    originalStyles[id] = overriddenStyles.reduce((mem, s) => {
      mem[s] = node.style[s]
      return mem
    }, {})
  }

  if (eleToOutline.includes(node.nodeName)) {
    node.style.outline = `${colors.highlight} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '2px')
    node.style.filter = 'brightness(110%)'
  } else {
    node.style.outline = `${colors.highlight} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '1px')
    node.style.filter = 'brightness(110%)'
    // node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  }

  if (!item.ribbonBox) {
    const { box: actions, arrow: arrowEle } = RibbonBox(keys)
    document.body.appendChild(actions)

    let refEle = node
    // const arrowLen = arrowEle.offsetWidth

    // better placement for element only containing text
    // note: for html we would have to calculate based on children...
    if (node.childNodes.length === 1) {
      const childNode = node.childNodes[0]

      if (childNode && childNode.nodeName === '#text') {
        const range = document.createRange()
        range.selectNode(childNode)
        const rect = range.getBoundingClientRect()

        refEle = {
          getBoundingClientRect () {
            return rect
          }
        }
      }
    }

    computePosition(refEle, actions, {
      placement: 'right',
      middleware: [
        flip({ fallbackPlacements: ['left', 'bottom'] }),
        shift(),
        offset(({ placement, rects }) => {
          if (placement === 'bottom') return rects.r
          return 35
        }),
        arrow({
          element: arrowEle
        })
      ]
    }).then(({ x, y, middlewareData, placement }) => {
      Object.assign(actions.style, {
        left: `${x}px`,
        top: `${y}px`,
        display: 'inline-flex'
      })

      const side = placement.split('-')[0]

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right'
      }[side]

      if (middlewareData.arrow) {
        const { x, y } = middlewareData.arrow
        Object.assign(arrowEle.style, {
          left: x != null ? `${x}px` : '',
          top: y != null ? `${y}px` : '',
          // Ensure the static side gets unset when
          // flipping to other placements' axes.
          right: '',
          bottom: '',
          [staticSide]: `${side === 'bottom' ? -18 : -25}px`,
          transform: side === 'bottom' ? 'rotate(90deg)' : side === 'left' ? 'rotate(180deg)' : ''
        })
      }
    })

    // store them for remove
    item.ribbonBox = actions
  }
}

export function highlightUninstrumented (item, node, keys) {
  const { id } = item

  if (selected[id]) return

  if (!originalStyles[id]) {
    originalStyles[id] = overriddenStyles.reduce((mem, s) => {
      mem[s] = node.style[s]
      return mem
    }, {})
  }

  if (eleToOutline.includes(node.nodeName)) {
    node.style.outline = `${colors.warning} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '2px')
    node.style.filter = 'brightness(110%)'
  } else {
    node.style.outline = `${colors.warning} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '1px')
    node.style.filter = 'brightness(110%)'
    // node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  }
}

export function selectedHighlight (item, node, keys) {
  const { id } = item

  if (!originalStyles[id]) {
    originalStyles[id] = overriddenStyles.reduce((mem, s) => {
      mem[s] = node.style[s]
      return mem
    }, {})
  }

  if (eleToOutline.includes(node.nodeName)) {
    node.style.outline = `${colors.highlight} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '2px')
    // node.style.filter = 'brightness(110%)';
    node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  } else {
    node.style.outline = `${colors.highlight} solid 1px`
    node.style.setProperty('border-radius', '1px')
    node.style.setProperty('outline-offset', '1px')
    // node.style.filter = 'brightness(110%)';
    node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  }

  // hide ribbons
  if (item.ribbonBox) {
    document.body.removeChild(item.ribbonBox)

    delete item.ribbonBox
  }

  selected[id] = true
}

export function resetHighlight (item, node, keys, ignoreSelected = true) {
  const { id } = item

  if (ignoreSelected && selected[id]) return

  if (originalStyles[id]) {
    overriddenStyles.forEach(s => {
      node.style.setProperty(s, originalStyles[id][s])
    })
    delete originalStyles[id]
  }

  if (item.ribbonBox) {
    document.body.removeChild(item.ribbonBox)

    delete item.ribbonBox
  }

  delete selected[id]
}
