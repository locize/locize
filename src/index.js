import i18next from 'i18next';
import LocizeBackend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(LocizeBackend)
  .use(LanguageDetector);

const enforce = {
  saveMissingTo: 'all'
};

const defaults = {
  saveMissing: true
};

// override init
let originalInit = i18next.init;
i18next.init = function(options, callback) {
  originalInit.call(i18next, { ...defaults, ...options, ...enforce }, callback);
}

export default i18next;
