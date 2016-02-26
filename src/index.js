import i18next from 'i18next';
import LocizeBackend from 'i18next-locize-backend';

i18next.use(LocizeBackend);

// override init
let originalInit = i18next.init;
i18next.init = function(options, callback) {
  originalInit.call(i18next, options, callback);
}

export default i18next;
