import { colors } from '../vars.js'
import { RibbonBox } from './elements/ribbonBox.js'
import { HighlightBox, positionHighlightBox } from './elements/highlightBox.js'
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom'
import { getOptimizedBoundingRectEle, isInViewport } from './utils.js'

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

// Positions (or re-positions) a ribbon box next to its reference element.
// Split out of highlight() so an existing ribbon can be moved in place when
// its node moves, instead of being torn down and re-created.
function positionRibbonBox (rectEle, actions, arrowEle) {
  return computePosition(rectEle, actions, {
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
}

// Re-aligns an item's existing overlays with its node, in place. A box is
// positioned in page coordinates once, when it is created - when the node
// moves without the page scrolling (a scrolling container, a reflow above
// it), the box stays behind. Moving the existing elements avoids the
// flicker that destroy-and-recreate would cause on every recompute tick.
export function repositionOverlays (item, node) {
  if (!item.highlightBox || !node) return

  const rectEle = getOptimizedBoundingRectEle(node)
  const rect = rectEle.getBoundingClientRect()
  const style = item.highlightBox.style
  const drifted =
    Math.abs(parseFloat(style.top) - (rect.top - 2 + window.scrollY)) > 1 ||
    Math.abs(parseFloat(style.left) - (rect.left - 2 + window.scrollX)) > 1 ||
    Math.abs(parseFloat(style.height) - (rect.height + 4)) > 1 ||
    Math.abs(parseFloat(style.width) - (rect.width + 4)) > 1

  // The ribbon is placed with floating-ui's shift(), which clamps it into the
  // viewport - re-placing it for an off-screen node would pin it to the screen
  // edge, pointing at nothing. Hide it while the node is off-screen; re-placing
  // it below turns it back on (positionRibbonBox sets display).
  const ribbonHidden =
    item.ribbonBox && item.ribbonBox.style.display === 'none'
  if (item.ribbonBox && !isInViewport(node)) {
    item.ribbonBox.style.display = 'none'
    if (drifted) positionHighlightBox(item.highlightBox, rectEle)
    return
  }

  if (!drifted && !ribbonHidden) return

  positionHighlightBox(item.highlightBox, rectEle)
  if (item.ribbonBox && item.ribbonArrow) {
    positionRibbonBox(rectEle, item.ribbonBox, item.ribbonArrow)
  }
}

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
    const box = HighlightBox(rectEle, 'none' /* colors.highlight */, 'rgba(0,0,0,0.1)')
    document.body.appendChild(box)
    item.highlightBox = box
  }

  if (!item.ribbonBox) {
    const { box: actions, arrow: arrowEle } = RibbonBox(keys)
    document.body.appendChild(actions)

    positionRibbonBox(rectEle, actions, arrowEle)

    // store them for remove and for repositioning in place
    item.ribbonBox = actions
    item.ribbonArrow = arrowEle
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
    const box = HighlightBox(rectEle, 'none' /* colors.highlight */, colors.gray)
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
    delete item.ribbonArrow
  }

  delete selected[id]
}
