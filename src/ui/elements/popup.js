// import { colors } from '../../vars.js'
import { sheet } from '../stylesheet.js'
import { startMouseTracking, stopMouseTracking } from '../mouseDistance.js'

import { minimizeIconUrl, locizeIconUrl } from './icons.js'

if (sheet) {
  sheet.insertRule(
    `@keyframes i18next-editor-animate-top { 
      from {
        top: calc(100vh + 600px); 
        left: calc(100vw + 300px);
        opacity: 0;
      }
      to {
        top: var(--i18next-editor-popup-position-top);
        left: var(--i18next-editor-popup-position-left);
        opacity: 1;
      }
    }`
  )
  sheet.insertRule(
    `@keyframes i18next-editor-animate-bottom { 
      from {
        top: var(--i18next-editor-popup-position-top);
        left: var(--i18next-editor-popup-position-left);
        opacity: 1;
      }
      to {
        top: calc(100vh + 600px); 
        left: calc(100vw + 300px);
        opacity: 0;
      }
    }`
  )
  sheet.insertRule(
    `.i18next-editor-popup * { 
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
    }`
  )
  sheet.insertRule(
    `.i18next-editor-popup .resizer-right {
      width: 15px;
      height: 100%;
      background: transparent;
      position: absolute;
      right: -15px;
      bottom: 0;
      cursor: e-resize;
    }`
  )
  sheet.insertRule(
    `.i18next-editor-popup .resizer-both {
      width: 15px;
      height: 15px;
      background: transparent;
      z-index: 10;
      position: absolute;
      right: -15px;
      bottom: -15px;
      cursor: se-resize;
    }`
  )
  sheet.insertRule(
    `.i18next-editor-popup .resizer-bottom {
      width: 100%;
      height: 15px;
      background: transparent;
      position: absolute;
      right: 0;
      bottom: -15px;
      cursor: s-resize;
    }`
  )
}

function Ribbon (popupEle, onMaximize) {
  const ribbon = document.createElement('div')
  ribbon.setAttribute('data-i18next-editor-element', 'true')
  ribbon.style = `
  cursor: pointer;
  position: fixed;
  bottom: 25px;
  right: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color:  rgba(249, 249, 249, 0.2);
  backdrop-filter: blur(3px);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  `

  ribbon.onclick = () => {
    onMaximize()
  }

  // i18next Logo
  const image = document.createElement('img')
  image.src = locizeIconUrl
  image.style.width = '45px'

  ribbon.appendChild(image)

  return ribbon
}

function Minimize (popupEle, onMinimize) {
  const image = document.createElement('img')
  image.setAttribute('data-i18next-editor-element', 'true')
  image.src = minimizeIconUrl
  image.style.width = '24px'
  image.style.cursor = 'pointer'

  image.onclick = () => {
    popupEle.style.setProperty(
      '--i18next-editor-popup-position-top',
      popupEle.style.top
    )
    popupEle.style.setProperty(
      '--i18next-editor-popup-position-left',
      popupEle.style.left
    )

    popupEle.style.animation = 'i18next-editor-animate-bottom 2s forwards'

    onMinimize()
  }

  return image
}

export const popupId = 'i18next-editor-popup'

export function Popup (url, cb) {
  const popup = document.createElement('div')
  popup.setAttribute('id', popupId)
  popup.classList.add('i18next-editor-popup')
  popup.style = `
  background-color: transparent;
  border: 1px solid rgba(200, 200, 200, 0.9);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  --i18next-editor-popup-height: 200px;
  height: var(--i18next-editor-popup-height);
  min-height: 150px;
  min-width: 300px;
  --i18next-editor-popup-width: 400px;
  width: var(--i18next-editor-popup-width);
  max-height: 800px;
  max-width: 1000px;

  position: fixed;
  --i18next-editor-popup-position-top: calc(100vh - var(--i18next-editor-popup-height) - 10px);
  top: calc(100vh - var(--i18next-editor-popup-height) - 10px);
  --i18next-editor-popup-position-left: calc(100vw - var(--i18next-editor-popup-width) - 10px);
  left: calc(100vw - var(--i18next-editor-popup-width) - 10px);

  overflow: visible;
  z-index: 99999;
  `
  popup.setAttribute('data-i18next-editor-element', 'true')

  const header = document.createElement('div')
  header.classList.add('i18next-editor-popup-header')
  header.style = `
  padding: 2px 10px;
  cursor: move;
  z-index: 10;
  backdrop-filter: blur(3px);
  background-color: rgba(200, 200, 200, 0.5);
  background: linear-gradient(0deg, rgba(200, 200, 200, 0.6), rgba(200, 200, 200, 0.5));
  color: #fff;
  text-align: right;
  `

  popup.appendChild(header)
  header.appendChild(
    Minimize(popup, () => {
      const ribbon = Ribbon(popup, () => {
        popup.style.animation = 'i18next-editor-animate-top 1s'

        startMouseTracking()

        setTimeout(() => {
          document.body.removeChild(ribbon)
        }, 1000)
      })

      document.body.appendChild(ribbon)
      stopMouseTracking()
    })
  )

  const iframe = document.createElement('iframe')
  iframe.setAttribute('id', 'i18next-editor-iframe')
  iframe.setAttribute('data-i18next-editor-element', 'true')
  iframe.style = `
    z-index: 100;
    width: 100%;
    height: calc(100% - 32px);
    border: none;
    background: #fff;
  `
  iframe.setAttribute('src', url)
  iframe.addEventListener('load', cb)
  popup.appendChild(iframe)

  // a blur over to avoid mouse tracking during drag, resize
  const overlay = document.createElement('div')
  overlay.setAttribute('id', 'i18next-editor-popup-overlay')
  overlay.setAttribute('data-i18next-editor-element', 'true')
  overlay.style = `
  display: none;
  position: absolute;
  top: 32px;
  z-index: 101;
  width: 100%;
  height: calc(100% - 32px);
  background-color: rgba(200, 200, 200, 0.5);
  background: linear-gradient(0deg, rgba(240, 240, 240, 0.6), rgba(255, 255, 255, 0.5));
  backdrop-filter: blur(2px);
`
  popup.appendChild(overlay)

  return popup
}
