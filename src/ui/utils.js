/* eslint-disable prefer-const, one-var */

export function isInViewport (element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function mouseDistanceFromElement (mouseEvent, element) {
  let $n = element,
    mX = mouseEvent.pageX,
    mY = mouseEvent.pageY,
    from = { x: mX, y: mY },
    off = $n.getBoundingClientRect(),
    ny1 = off.top + document.body.scrollTop, // top
    ny2 = ny1 + $n.offsetHeight, // bottom
    nx1 = off.left + document.body.scrollLeft, // left
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
