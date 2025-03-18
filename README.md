[![npm version](https://img.shields.io/npm/v/locize.svg?style=flat-square)](https://www.npmjs.com/package/locize)

# locize

The locize script enables the [incontext editing](https://www.locize.com/docs/context#incontext) feature provided by [locize](https://locize.com).

## Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locize), [downloaded](https://github.com/locize/locize/blob/master/locize.min.js) from this repo or loaded from the npm CDN [unpkg.com/locize](https://unpkg.com/locize/locize.min.js).

```html
<script src="https://unpkg.com/locize/locize.min.js"></script>
```

Using a module bundler simplest will be adding the script using npm (or yarn).

```bash
npm i locize
```

**Hint:** This module works only in the browser environment.

# How it works

The script will parse the page content and pass found segments to locize using the browsers postMessage API. To work a text on your page has to be exactly matched to a segment in the editor by determing the matching namespace and key.

There are three ways to get the namespace and key:

## 1) Using subliminal

By default using [locizify](https://github.com/locize/locizify) or the `locizePlugin` the translations on your page will contain hidden text containing that information by using [subliminal](https://github.com/i18next/i18next-subliminal)

## 2) Using data-attributes

Extend your html to contain that information

`data-i18n` -> will pass exact key

`data-i18n-ns` -> will pass namespace name

eg.:

```html
<div data-i18n-ns="usedNamespace">
  <p data-i18n="usedKey">Some translated text</p>
</div>

// or using ns:key
<p data-i18n="ns:key">Some translated text</p>
```

Specifing content as [html](https://github.com/i18next/jquery-i18next?tab=readme-ov-file#set-innerhtml-attributes) or [title/placeholder attribute](https://github.com/i18next/jquery-i18next?tab=readme-ov-file#set-different-attribute) is also supported like used in `jquery-i18next`

## 3) Lookup in locize

If not using recommended 1) or 2) the script will send the raw texts to the editor which will try an exact search for that text and send the found exact match back (only one result with 100% exact match).

# Setup

## with locizify

This plugin is already included in [locizify](https://github.com/locize/locizify) >= v4.1.0

**Hint:** show the incontext editor popup by adding incontext=true query paramenter, i.e. http://localhost:8080?incontext=true

## with i18next

For i18next we provide a plugin to be used.

```js
import { locizePlugin } from 'locize'

i18next.use(locizePlugin)
```

**Hint:** this will show the locize incontext editor as a popup in your website only if the url contains the incontext=true query paramenter, i.e. http://localhost:8080?incontext=true

Open as default:

```js
import { locizeEditorPlugin } from 'locize'

i18next.use(locizeEditorPlugin({ show: true }))
```

Using `react-i18next` you might want to bind the editorSaved event to trigger a rerender each time you save changes in the editor:

```js
i18next.init({
  // ...
  react: {
    bindI18n: 'languageChanged editorSaved'
  }
})
```

**Hint** you can match the integration to a locize project by:

Having [i18next-locize-backend](https://github.com/locize/i18next-locize-backend) configured or adding

```js
i18next.init({
  // ...
  editor: {
    projectId: "5e9ed7da-51ab-4b15-888b-27903f06be09"
    version: "latest"
  }
})
```

## not using i18next (messageformat, fluent, ...)

Not using i18next currently only the option to show your website inside the locize incontext view (https://www.locize.com/docs/incontext).

### using import

```js
import { addLocizeSavedHandler, startStandalone, setEditorLng } from 'locize'

// optional
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

**Hint** you can match the integration to a locize project by adding:

```js
startStandalone({
  projectId: "5e9ed7da-51ab-4b15-888b-27903f06be09",
  version: "latest"
})
```

**Hint:** show the incontext editor popup by adding incontext=true query paramenter, i.e. http://localhost:8080?incontext=true

or

```js
startStandalone({
  show: true
})
```

### vanilla javascript

Only relevant when your website is shown inside the locize incontext solution via incontext view (https://www.locize.com/docs/incontext).

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

**Hint** you can match the integration to a locize project by adding:

```js
<script
  id="locize"
  projectid="5e9ed7da-51ab-4b15-888b-27903f06be09"
  version="latest"
  src="https://unpkg.com/locize/locize.min.js"
>
```
