import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-locize-backend'

// import { locizePlugin } from 'locize'
import { locizeEditorPlugin } from 'locize'

// OPTIONAL IF YOU LIKE TO SEE ALL (LOGIN TO TRANSLATION MANAGEMENT EDITOR)
// 1) signup at https://locize.com/register and login
// 2) create a new project
// 3) copy/paste your projectId, apiKey below
// 4) add de as additional language
// 5a) import en from: http://api.locize.app/ce0cf818-32e5-44a5-b7f0-4ea9e840d962/latest/en/translation
// 5b) import de from: http://api.locize.app/ce0cf818-32e5-44a5-b7f0-4ea9e840d962/latest/de/translation
const locizeOptions = {
  projectId: '5e9ed7da-51ab-4b15-888b-27903f06be09',
  version: 'latest',
  getLanguagesPath: 'https://api-dev.locize.app/languages/{{projectId}}',
  loadPath: 'https://api-dev.locize.app/{{projectId}}/latest/{{lng}}/{{ns}}',
  addPath: 'https://api-dev.locize.app/missing/{{projectId}}/latest/{{lng}}/{{ns}}'
}

i18n
  // .use(locizePlugin)
  .use(locizeEditorPlugin({ show: true }))
  // i18next-locize-backend
  // loads translations from your project, saves new keys to it (saveMissing: true)
  // https://github.com/locize/i18next-locize-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,
    saveMissing: true,
    // keySeparator: false,

    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    backend: locizeOptions,
    locizeLastUsed: locizeOptions,
    react: {
      bindI18n: 'languageChanged editorSaved'
    }
  })

export default i18n
