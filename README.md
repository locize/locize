[![Travis](https://img.shields.io/travis/locize/locize/master.svg?style=flat-square)](https://travis-ci.org/locize/i18next-locize-backend)
[![Coveralls](https://img.shields.io/coveralls/locize/locize/master.svg?style=flat-square)](https://coveralls.io/github/locize/locize)
[![npm version](https://img.shields.io/npm/v/locize.svg?style=flat-square)](https://www.npmjs.com/package/locize)
[![Bower](https://img.shields.io/bower/v/locize.svg)]()
[![David](https://img.shields.io/david/locize/locize.svg?style=flat-square)](https://david-dm.org/locize/locize)

# locize.js

locize.js is a prebundled i18next client to use in the browser. It bundles [i18next](http://i18next.com/), the [language detector](https://github.com/i18next/i18next-browser-languageDetector) and the [locize backend](https://github.com/locize/i18next-locize-backend).

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locize), bower or [downloaded](https://github.com/locize/locize/blob/master/locize.min.js) from this repo.

```
# npm package
$ npm install locize

# bower
$ bower install locize
```

```
import locize from 'locize';

locize.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  },
  backend: {
    projectId: '[PROJECT_ID]',
    apiKey: '[API_KEY]',
    referenceLng: 'en'
  }
}, (err, t) => {
  // initialized and ready to go!
  const hw = locize.t('key'); // hw = 'hello world'
});
```

For more information visit the i18next website:

- [Getting started](http://i18next.com/docs/)
- [Translation Functionality](http://i18next.com/translate/)
- [API](http://i18next.com/docs/api/)
- [Migration Guide from v1.11.x](http://i18next.com/docs/migration/)
