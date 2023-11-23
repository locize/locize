[![npm version](https://img.shields.io/npm/v/locize.svg?style=flat-square)](https://www.npmjs.com/package/locize)

# locize

The locize script enables you to directly connect content from your website / application with your content on your localization project on locize.

## Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locize), [downloaded](https://github.com/locize/locize/blob/master/locize.min.js) from this repo or loaded from the npm CDN [unpkg.com/locize](https://unpkg.com/locize/locize.min.js).

Adding the script or importing it is enough.

```bash
npm i locize
```

**Hint:** This module runs only in browser.

### InContext variants

For i18next based solutions (i18next, react-i18next, locizify, ...) there are two options to work with locize incontext:

#### a) Iframe on your page

The solution is best in class and uses [i18next-subliminal](https://github.com/i18next/i18next-subliminal) to add information about key and namespace as hidden text to the output of the `i18next.t` calls. Beside that it scans your website based on mutation observer to look out for those texts.

You can both click text elements on your website or keys in the locize iframe to edit content. Results will always be exact matches based on the namespace and key.

**Hint:** You can bind the ifame to a specific project by setting `ì18next.options.editor = { projectId, version }` or `ì18next.options.backend = { projectId, verstion }` (backend info might already exist when using i18next-locize-backend)

**Caveats:** You might have elements that rerender too often in short time. This might will give you a warning output in console that that element change was ignored for passing to the iframe. Consider adding the `data-locize-editor-ignore: true` attribute to the element to ignore it completely.

#### b) Opening it on https://locize.app

Details for setting this up can be found [here](https://docs.locize.com/different-views/incontext)

The solution extracts the text on the clicked element and passes it for a fuzzy search to the parent frame. As the search is fuzzy there is no guarantee for exact results.

**hint** To get exact matches you can add following attributes to the element or it's parent:

`data-i18n` -> will pass exact key
`data-i18n-ns` -> will pass namespace name

# Using

## with locizify

This plugin is already included in [locizify](https://github.com/locize/locizify) >= v4.1.0

## with i18next

### this will show the locize incontext editor as a popup in your website
```js
import { locizePlugin } from 'locize';

i18next.use(locizePlugin);
```

### this will show the locize incontext editor as a popup in your website only if the url contains the incontext=true query paramenter, i.e. http://localhost:8080?incontext=true
```js
import { locizeEditorPlugin } from 'locize';

i18next.use(locizeEditorPlugin());
```

Using react-i18next you might want to bind the editorSaved event to trigger a rerender:

```js
i18next.init({
  // ...
  react: {
    bindI18n: 'languageChanged editorSaved'
  }
})
```

## without i18next

Not using i18next currently only the option to show your website inside the locize incontext solution (https://locize.app) is available.

### with other as module

```js
import { addLocizeSavedHandler, startStandalone, setEditorLng } from 'locize'

addLocizeSavedHandler(res => {
  res.updated.forEach(item => {
    const { lng, ns, key, data } = item
    // load the translations somewhere...
    // and maybe rerender your UI
  })
})

// start
startStandalone()

// switch lng in locize editor
setEditorLng(lng)
```

### with other in vanilla javascript

Only relevant when your website is shown inside the locize incontext solution on https://locize.app.

```html
<script src="https://unpkg.com/locize/locize.min.js" />
```

```js
window.locizeSavedHandler = res => {
  res.updated.forEach(item => {
    const { lng, ns, key, data } = item
    // load the translations somewhere...
    // and maybe rerender your UI
  })
}

window.locizeStartStandalone()
```

**Hint** you can fix the integration to a locize project by adding:

```js
<script
  id="locize"
  projectid="5e9ed7da-51ab-4b15-888b-27903f06be09"
  version="latest"
  src="https://unpkg.com/locize/locize.min.js"
>
```

### turn on/off click interception programmatically

```js
import { turnOn, turnOff } from 'locize'

let isOff

// or use window.locize.turnOn
isOff = turnOff() // -> true
isOff = turnOn() // -> false
```
