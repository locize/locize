### 4.0.14

- fix typescript types for startStandalone

### 4.0.13

- update i18next-subliminal

### 4.0.12

- locizePlugin: start i18next-subliminal only if popup or in iframe

### 4.0.11

- fix highlighting

### 4.0.5

- fix some typos

### 4.0.0

- support also non-i18next environments

### 3.3.0

- support i18next-subliminal in clickHandler used in locize iframe

### 3.2.5

- fix startStandalone: added handler for committed message

### 3.2.3

- fix startStandalone: added missing functions for implementation

### 3.2.2

- fix startLegacy (should only run if in iframe)

### 3.2.1

- prefer to get resolvedLanguage for getLng if available

### 3.2.0

- using the locizePlugin export should only show the incontext editor if passing `?incontext=true`

### 3.1.1

- prevent to append popup multiple times

### 3.1.0

- additional plugin interface that shows incontext only if passing `?incontext=true`

### 3.0.5

- fix scrollTop

### 3.0.4

- style: adapt hight

### 3.0.3

- ignore element flag

### 3.0.2

- optimize detection for i18next backend

### 3.0.1

- fix for use cases where body may be invisible first

### 3.0.0

- This module can now be used for both type of incontext editors - as iframe (old) or with iframe (new).
- showLocizeLink has been removed, since conflicting with new incontext editor

### 2.4.6

- add basic types

### 2.4.5

- only handle messages containing data.message

### 2.4.4

- check for window

### 2.4.3

- send href changed on load

### 2.4.2

- optimize handling of setEditorLng if called to early

### 2.4.0

- forward href changes
- forward lng change (if using i18nextPlugin)
- fallback ns detected to defaultNS if locizify

### 2.3.1

- code cosmetics and updated deps

### 2.3.0

- add turnOn, turnOff function for programmatical on/off

### 2.2.5

- check if window exists

### 2.2.4

- if cat not ready, postpone missing keys

### 2.2.3

- check automatically if is in iframe and attach missingKeyHandler conditionally

### 2.2.2

- select partial text for divs

### 2.2.1

- remove window.locizeBoundPostMessageAPI check

### 2.2.0

- add locizePlugin to be used in i18next
- add onAddedKey function

### 2.1.0

- add addLocizeSavedHandler

### 2.0.0

- initial version for using with the locize UI in context editor (postMessage API)

### pre 2.0.0

- locize module was used as a combination of i18next + the locize-backend
