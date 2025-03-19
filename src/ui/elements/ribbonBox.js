import { colors } from '../../vars.js'
import { sheet } from '../stylesheet.js'
import { api } from '../../api/index.js'

import { EditIcon } from './icons.js'

if (sheet) {
  sheet.insertRule(
    '.i18next-editor-button:hover { background-color: rgba(21, 65, 154, 1) !important; }'
  )
}
export function RibbonButton (text, attrTitle, onClick) {
  const btn = document.createElement('button')

  btn.style =
    'font-family: Arial; position: relative; backdrop-filter: blur(3px); cursor: pointer; padding: 2px 10px 2px 20px; font-size: 15px; font-weight: 300; text-transform: uppercase; color: #fff; background-color: rgba(25, 118, 210, 0.8); border: none; border-radius: 12px; '
  btn.classList.add('i18next-editor-button')
  btn.setAttribute('data-i18next-editor-element', 'true')
  btn.setAttribute('title', attrTitle)

  const icon = EditIcon()
  icon.style = 'position: absolute; left: 4px; top: 3px;'
  icon.style.width = '15px'
  btn.appendChild(icon)

  const span = document.createElement('span')
  span.textContent = text
  btn.appendChild(span)

  btn.onclick = onClick

  return btn
}

export function RibbonBox (keys = {}) {
  const box = document.createElement('div')
  box.classList.add('i18next-editor-button-container')
  box.style =
    'position: absolute; top: 0; left: 0; display: flex; align-items: flex-start; justify-content: center; filter: drop-shadow(0px 0px 20px #aaa ); z-index: 99999;'
  box.setAttribute('data-i18next-editor-element', 'true')

  const arrow = document.createElement('div')
  arrow.style = `
    position: absolute;
    width: 0;
    height: 0;
    border-top-width: 7px;
    border-bottom-width: 7px;
    border-left-width: 10px;
    border-right-width: 10px;
    border-style: solid;
    border-color: transparent ${colors.highlight} transparent
      transparent;
    `
  box.appendChild(arrow)

  // const logo = RibbonLogo()
  // box.appendChild(logo)

  const btnbox = document.createElement('div')
  btnbox.style =
    'display: flex; flex-direction: column; align-items: flex-start; margin-left: 2px; margin-top: 1px'

  Object.keys(keys).forEach(k => {
    const data = keys[k]

    const btn = RibbonButton(
      k.replace('attr:', ''),
      `${data.ns}:${data.key}`,
      () => {
        api.selectKey(data)
      }
    )
    btn.style.marginBottom = '2px'
    btnbox.appendChild(btn)
  })

  box.appendChild(btnbox)

  return { box, arrow }
}
