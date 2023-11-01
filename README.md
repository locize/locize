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

## Using

### with a bundler

Just init like:

```js
import 'locize';
```

### by including the script

```html
<script src="https://unpkg.com/locize/locize.min.js" />
```

### with i18next

```js
import { locizePlugin } from 'locize';

i18next.use(locizePlugin);
```

Using react-i18next you might want to bind the editorSaved event to trigger a rerender:

```js
i18next.init({
  // ...
  react: {
    bindI18n: 'languageChanged editorSaved',
  },
});
```

### with locizify

This plugin is already included in [locizify](https://github.com/locize/locizify) >= v4.1.0

### with other as module

```js
import { addLocizeSavedHandler, setEditorLng } from 'locize';

addLocizeSavedHandler((res) => {
  res.updated.forEach((item) => {
    const { lng, ns, key, data } = item;
    // load the translations somewhere...
    // and maybe rerender your UI
  });
});

// switch lng in locize editor
setEditorLng(lng);
```

### with other in vanilla javascript

```html
<script src="https://unpkg.com/locize/locize.min.js" />
```

```js
window.locizeSavedHandler = (res) => {
  res.updated.forEach((item) => {
    const { lng, ns, key, data } = item;
    // load the translations somewhere...
    // and maybe rerender your UI
  });
};
```

## turn on/off programmatically

```js
import { turnOn, turnOff } from 'locize';

let isOff;

// or use window.locize.turnOn
isOff = turnOff(); // -> true
isOff = turnOn(); // -> false
```

## show link to locize

```js
import { showLocizeLink } from 'locize';

// or use window.locize.showLocizeLink
showLocizeLink({
  projectId: 'YOUR PROJECTID',
  version: 'latest',
});

// when using with i18next or locizify projectId and version will be picked from backend options if available
```
