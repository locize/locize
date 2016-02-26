# Introduction

[![Travis](https://img.shields.io/travis/locize/locize/master.svg?style=flat-square)](https://travis-ci.org/locize/i18next-locize-backend)
[![Coveralls](https://img.shields.io/coveralls/locize/locize/master.svg?style=flat-square)](https://coveralls.io/github/locize/locize)
[![npm version](https://img.shields.io/npm/v/locize.svg?style=flat-square)](https://www.npmjs.com/package/locize)
[![Bower](https://img.shields.io/bower/v/locize.svg)]()
[![David](https://img.shields.io/david/locize/locize.svg?style=flat-square)](https://david-dm.org/locize/locize)

This is a simple i18next backend to be used for locize service. It will load resources from locize server using xhr.

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locize), bower or [downloaded](https://github.com/locize/locize/blob/master/locize.min.js) from this repo.

```
# npm package
$ npm install locize

# bower
$ bower install locize
```

Wiring up:

```js
import i18next from 'i18next';
import Locize from 'i18next-locize-backend';

i18next
  .use(Locize)
  .init(i18nextOptions);
```

- As with all modules you can either pass the constructor function (class) to the i18next.use or a concrete instance.
- If you don't use a module loader it will be added to `window.i18nextLocizeBackend`

## Backend Options

```js
{
  // path where resources get loaded from
  loadPath: '/locales/{{lng}}/{{ns}}.json',

  // path to post missing resources
  addPath: 'locales/add/{{lng}}/{{ns}}',

  // your backend server supports multiloading
  // /locales/resources.json?lng=de+en&ns=ns1+ns2
  allowMultiLoading: false,

  // parse data after it has been fetched
  // in example use https://www.npmjs.com/package/json5
  // here it removes the letter a from the json (bad idea)
  parse: function(data) { return data.replace(/a/g, ''); },

  // allow cross domain requests
  crossDomain: false,

  // define a custom xhr function
  // can be used to support XDomainRequest in IE 8 and 9
  ajax: function (url, options, callback, data) {}
}
```

Options can be passed in:

**preferred** - by setting options.backend in i18next.init:

```js
import i18next from 'i18next';
import Locize from 'i18next-locize-backend';

i18next
  .use(Locize)
  .init({
    backend: options
  });
```

on construction:

```js
  import Locize from 'i18next-locize-backend';
  const locize = new Locize(null, options);
```

via calling init:

```js
  import Locize from 'i18next-locize-backend';
  const locize = new Locize();
  locize.init(options);
```
