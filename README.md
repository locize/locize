[![npm version](https://img.shields.io/npm/v/locize.svg?style=flat-square)](https://www.npmjs.com/package/locize)

# locize

The locize script enables the [incontext editing](https://www.locize.com/docs/context#incontext) feature provided by [Locize](https://www.locize.com).

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

The script will parse the page content and pass found segments to Locize using the browsers postMessage API. To work a text on your page has to be exactly matched to a segment in the editor by determing the matching namespace and key.

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

## 3) Lookup in Locize

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

**Hint:** this will show the Locize incontext editor as a popup in your website only if the url contains the incontext=true query paramenter, i.e. http://localhost:8080?incontext=true

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

**Hint** you can match the integration to a Locize project by:

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

## customizing the minimized button

The minimized editor button (bottom-right circle) can be moved to the left via option:

```js
i18next.use(locizeEditorPlugin({ ribbonPosition: 'bottom-left' }))
// or startStandalone({ ribbonPosition: 'bottom-left' })
// or <script id="locize" ribbonposition="bottom-left" ...>
```

For full control, target the stable CSS class:

```css
.locize-incontext-ribbon { bottom: 80px; right: 10px; }
```

## shadow DOM

If your translated content lives inside an **open shadow root**, the editor does
not see it by default: a shadow boundary stops DOM traversal *and* mutation
records, so neither the parser nor the `MutationObserver` on `document.body`
reaches into it.

Turn it on with the `shadowDOM` option:

```js
i18next.use(locizeEditorPlugin({ shadowDOM: true }))
// or startStandalone({ shadowDOM: true })
// or <script id="locize" shadowdom="true" ...>
```

With the option on, the editor walks into open shadow roots, observes each of
them individually (nested ones included), and hooks
`Element.prototype.attachShadow` so shadow roots created *after* the editor
started are picked up as well - the usual case, since the editor script usually
runs before the content is rendered into its shadow root. Closed shadow roots
(`{ mode: 'closed' }`) are only reachable if they are attached after the editor
started.

It is off by default because it widens what the editor touches, which is
unnecessary for pages that do not use shadow DOM.

## SSO login

When the editor popup finds no locize session, it offers to sign in through a
small locize window. SSO users enter their email there first, so locize can
find their provider. If your team signs in through SAML SSO (the
`https://www.locize.app/login/<id>` link), pass that `<id>` to skip the email
step and go straight to your identity provider:

```js
i18next.use(locizeEditorPlugin({ ssoIdentifier: 'your-sso-id' }))
// or in the i18next options, e.g. with locizify: editor: { ssoIdentifier: 'your-sso-id' }
// or startStandalone({ ssoIdentifier: 'your-sso-id' })
// or <script id="locize" ssoidentifier="your-sso-id" ...>
```

## troubleshooting

If the editor popup stays blank or "could not connect" is shown:

- Make sure you are logged in at https://www.locize.app (open it in another tab, log in, reload your page).
- Your page's Content-Security-Policy must allow `frame-src https://incontext.locize.app`.
- An adblocker may block the editor iframe.
- Enable verbose diagnostics with `localStorage.setItem('locize-debug', 'true')` (or `?locizeDebug=true`) and check the browser console.

## not using i18next (messageformat, fluent, ...)

Not using i18next currently only the option to show your website inside the Locize incontext view (https://www.locize.com/docs/incontext).

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

**Hint** you can match the integration to a Locize project by adding:

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

Only relevant when your website is shown inside the Locize incontext solution via incontext view (https://www.locize.com/docs/incontext).

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

**Hint** you can match the integration to a Locize project by adding:

```js
<script
  id="locize"
  projectid="5e9ed7da-51ab-4b15-888b-27903f06be09"
  version="latest"
  src="https://unpkg.com/locize/locize.min.js"
>
```
