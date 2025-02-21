/* eslint-disable prefer-const, one-var */

export function isInViewport (el) {
  // Special bonus for those using jQuery
  // if (typeof jQuery !== 'undefined' && el instanceof jQuery) el = el[0]

  const rect = el.getBoundingClientRect()
  // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
  const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0
  const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0

  return vertInView && horInView
}

export function mouseDistanceFromElement (mouseEvent, element) {
  let $n = element,
    mX = mouseEvent.pageX,
    mY = mouseEvent.pageY,
    from = { x: mX, y: mY },
    off = $n.getBoundingClientRect(),
    ny1 = off.top + document.documentElement.scrollTop, // top
    ny2 = ny1 + $n.offsetHeight, // bottom
    nx1 = off.left + document.documentElement.scrollLeft, // left
    nx2 = nx1 + $n.offsetWidth, // right
    maxX1 = Math.max(mX, nx1),
    minX2 = Math.min(mX, nx2),
    maxY1 = Math.max(mY, ny1),
    minY2 = Math.min(mY, ny2),
    intersectX = minX2 >= maxX1,
    intersectY = minY2 >= maxY1,
    to = {
      x: intersectX ? mX : nx2 < mX ? nx2 : nx1,
      y: intersectY ? mY : ny2 < mY ? ny2 : ny1
    },
    distX = to.x - from.x,
    distY = to.y - from.y,
    hypot = (distX ** 2 + distY ** 2) ** (1 / 2)
  return Math.floor(hypot) // this will output 0 when next to your element.
}

export function getOptimizedBoundingRectEle (node) {
  // get a bounding rect on main element or optimized inner text
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

  return refEle
}
