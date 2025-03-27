import { colors } from '../vars.js'
import { RibbonBox } from './elements/ribbonBox.js'
import { HighlightBox } from './elements/highlightBox.js'
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom'
import { getOptimizedBoundingRectEle } from './utils.js'

// const eleToOutline = [
//   'DIV',
//   'P',
//   'H1',
//   'H2',
//   'H3',
//   'H4',
//   'H5',
//   'H6',
//   'OL',
//   'UL',
//   'ADDRESS',
//   'BLOCKQUOTE',
//   'DL',
//   'PRE'
// ]
// const overriddenStyles = [
//   'outline',
//   'border-radius',
//   'outline-offset',
//   'filter'
// ]
// const originalStyles = {}
const selected = {}

export function highlight (item, node, keys) {
  // const { id } = item

  // uncomment below if we do not won't the ribbon box to show on selected
  // if (selected[id]) return

  /*
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
    */

  // get a bounding rect on main element or optimized inner text
  const rectEle = getOptimizedBoundingRectEle(node)

  if (!item.highlightBox) {
    const box = HighlightBox(rectEle, colors.highlight)
    document.body.appendChild(box)
    item.highlightBox = box
  }

  if (!item.ribbonBox) {
    const { box: actions, arrow: arrowEle } = RibbonBox(keys)
    document.body.appendChild(actions)

    computePosition(rectEle, actions, {
      placement: 'right',
      middleware: [
        flip({ fallbackPlacements: ['left', 'bottom'] }),
        shift(),
        offset(({ placement, rects }) => {
          if (placement === 'bottom') return -rects.reference.height / 2 - rects.floating.height / 2
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
          transform:
            side === 'bottom'
              ? 'rotate(90deg)'
              : side === 'left'
                ? 'rotate(180deg)'
                : ''
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

  // if (!originalStyles[id]) {
  //   originalStyles[id] = overriddenStyles.reduce((mem, s) => {
  //     mem[s] = node.style[s]
  //     return mem
  //   }, {})
  // }

  // if (eleToOutline.includes(node.nodeName)) {
  //   node.style.outline = `${colors.warning} solid 1px`
  //   node.style.setProperty('border-radius', '1px')
  //   node.style.setProperty('outline-offset', '2px')
  //   node.style.filter = 'brightness(110%)'
  // } else {
  //   node.style.outline = `${colors.warning} solid 1px`
  //   node.style.setProperty('border-radius', '1px')
  //   node.style.setProperty('outline-offset', '1px')
  //   node.style.filter = 'brightness(110%)'
  //   // node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  // }

  const rectEle = getOptimizedBoundingRectEle(node)

  if (!item.highlightBox) {
    const box = HighlightBox(rectEle, colors.warning)
    document.body.appendChild(box)
    item.highlightBox = box
  }
}

export function selectedHighlight (item, node, keys) {
  const { id } = item

  // if (!originalStyles[id]) {
  //   originalStyles[id] = overriddenStyles.reduce((mem, s) => {
  //     mem[s] = node.style[s]
  //     return mem
  //   }, {})
  // }

  // if (eleToOutline.includes(node.nodeName)) {
  //   // node.style.outline = `${colors.highlight} solid 1px`
  //   // node.style.setProperty('border-radius', '1px')
  //   // node.style.setProperty('outline-offset', '2px')
  //   // node.style.filter = 'brightness(110%)';
  //   node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  // } else {
  //   // node.style.outline = `${colors.highlight} solid 1px`
  //   // node.style.setProperty('border-radius', '1px')
  //   // node.style.setProperty('outline-offset', '1px')
  //   // node.style.filter = 'brightness(110%)';
  //   node.style.filter = `brightness(110%) drop-shadow(0px 0px 2px ${colors.highlight} )`
  // }

  const rectEle = getOptimizedBoundingRectEle(node)

  if (!item.highlightBox) {
    const box = HighlightBox(rectEle, colors.highlight, colors.gray)
    document.body.appendChild(box)
    item.highlightBox = box
  }

  // hide ribbons
  // if (item.ribbonBox) {
  //   document.body.removeChild(item.ribbonBox)

  //   delete item.ribbonBox
  // }

  selected[id] = true
}

export function recalcSelectedHighlight (item, node, keys) {
  if (!selected[item.id]) return
  resetHighlight(item, node, keys, false)
  selectedHighlight(item, node, keys)
}

export function resetHighlight (item, node, keys, ignoreSelected = true) {
  const { id } = item

  if (ignoreSelected && selected[id]) return

  // if (originalStyles[id]) {
  //   overriddenStyles.forEach(s => {
  //     node.style.setProperty(s, originalStyles[id][s])
  //   })
  //   delete originalStyles[id]
  // }

  if (item.highlightBox) {
    document.body.removeChild(item.highlightBox)

    delete item.highlightBox
  }

  if (item.ribbonBox) {
    document.body.removeChild(item.ribbonBox)

    delete item.ribbonBox
  }

  delete selected[id]
}
