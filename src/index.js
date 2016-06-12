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

i18next.getLanguages = function(callback) {
  if (i18next.services.backendConnector) {
    i18next.services.backendConnector.backend.getLanguages(callback);
  } else {
    function ready() {
      i18next.off('initialized', ready);
      i18next.services.backendConnector.backend.getLanguages(callback);
    }
    i18next.on('initialized', ready);
  }
}

export default i18next;
