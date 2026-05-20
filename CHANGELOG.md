### 4.1.0

- feat: ship a vue-i18n implementation alongside the existing i18next one. `src/implementations/vueI18nImplementation.js` mirrors the shape of `i18nextImplementation.js` but operates on a vue-i18n composer (`useI18n({ useScope: 'global' })` / `nuxtApp.$i18n` under `@nuxtjs/i18n`). Exposed at the package root as `getVueI18nImplementation(composer, options)`; the result is meant to be passed to `startStandalone({ implementation })`. Resource read/write uses `getLocaleMessage` / `mergeLocaleMessage` / `setLocaleMessage`; missing-key observation chains onto any existing `composer.missing` handler so a caller's saveMissing wiring is preserved; locale-change observation accepts an optional `watch` callable (`import { watch } from 'vue'`) and is a no-op if not provided (keeps `locize` framework-agnostic — no `vue` peer dep). `getLocizeDetails()` requires `projectId` / `version` / namespace info via options because vue-i18n carries no equivalent of i18next's `i18n.options.backend` shape. Saving missing keys to Locize and CDN-backed lazy loading remain caller-side concerns — that's a vue-i18n backend's job, not the editor's.
- fix: InContext editor not detecting translation segments when a host template merges literal text with a `t()` output into a single DOM text node (Vue's template compiler does this for patterns like `<a>→ {{ t('goto.second') }}</a>`, which renders as one text node `"→ ‌…wrapped translation…‌"`). `containsHiddenStartMarker` in `i18next-subliminal` is a `text.startsWith(marker)` check, so a literal prefix would push the start marker off position-0 and the parser's existing case-A guard (`hasHiddenStartMarker && hasHiddenMeta`) would silently skip the node. `src/parser.js` now adds a new case between A and B in `handleNode`: when the text has a hidden end marker AND we're not already in a multi-text merge (`hasHiddenMeta && !merge.length`), `unwrap` decodes the meta from anywhere in the string and the parent element is stored as a translation segment. Doesn't affect React + `<Trans>` (separate text nodes per segment), Angular pipes (full t-output as the node), or the existing split-marker merge logic for vue-i18n's `<i18n-t>` slots (merge.length is > 0 by the time the end marker arrives, so the new branch's `!merge.length` guard short-circuits and case D still closes the merge as `'html'`). Verified against i18next-subliminal's `containsHiddenMeta` semantics (requires the trailing 9 chars to decode to `'}'`, so stray invisible chars from unrelated sources can't false-positive into this case).
- fix(types): `startStandalone(opt)` now declares the `implementation` option in its TypeScript signature. It was always accepted at runtime (`src/startStandalone.js` destructures `{ implementation, ...rest } = options`), but the public type only listed `qsProp` / `show` / `projectId` / `version`, so TypeScript users hit `TS2353 Object literal may only specify known properties` when wiring a custom implementation. Also adds public `Implementation` and `LocizeDetails` interfaces and types `getVueI18nImplementation` end-to-end (including `VueI18nImplementationOptions` for the second argument). `index.d.mts` was previously a one-line `export * from './index.js'` that gave ESM consumers no type information; it now mirrors `index.d.ts` directly so both CJS and ESM resolution paths see the same shape.

### 4.0.24

- fix InContext editor popup flashing briefly and then disappearing when the host application hydrates the full document via `hydrateRoot(document, ...)` (e.g. React Router v7 framework mode, and any other SSR framework that takes ownership of `<body>` during hydration). When the server-rendered HTML and the client-rendered output diverged in any way — and the locize plugin itself can cause such a divergence on the client via i18next-subliminal, whose post-processor wraps translation values with invisible Unicode markers that are absent in the SSR pass — React's `clearContainerSparingly` (called from `commitBeforeMutationEffects` during hydration-mismatch recovery) removed any DOM children it didn't own, the popup included, producing the "popup visible for <1s then gone" symptom users reported on the React Router v7 + remix-i18next 7.x setup. `src/process.js` now (a) appends the popup to `document.documentElement` rather than into `<body>` (so a mismatch that recovers only the `<body>` container leaves the popup untouched), and (b) installs a short-lived MutationObserver that re-attaches the **same** popup element if it's removed in the first 10 seconds after init, capped at 5 reattachments. Re-using the same element (not a freshly built one) preserves all listeners that `initDragElement` / `initResizeElement` and the iframe URL wiring set up, so drag, resize, and the postMessage channel to the locize editor continue to work after a recovery. The watcher disconnects after the 10-second window so an intentional teardown later in the session is unaffected.
- fix `backendName` sent in `requestInitialize` payload not matching the locize editor's expected value. `src/implementations/i18nextImplementation.js` hardcoded `'I18nextLocizeBackend'` (lowercase "n") when it detected a Locize CDN `loadPath`, but the locize editor's `handleRequestInitialize` does a strict equality check against `'I18NextLocizeBackend'` (capital "N", matching the actual class name exported by `i18next-locize-backend`). The mismatch meant `currentConfig.isLocizeBackend` was always `false` in the editor even when the host application was clearly using `i18next-locize-backend`, which in turn caused the editor's Navigation dropdown (sync page entry, etc.) to be shown unconditionally. The hardcoded value now matches the upstream class name exactly.
- fix postMessage delivery to the InContext editor iframe being silently lost after a popup re-attachment. When the resurrection observer added in this release re-inserts the popup `<div>` into the DOM after React's hydration recovery, browsers re-navigate the contained iframe to its `src` (per the HTML spec — removing an iframe and re-inserting it discards the original document and starts a new navigation). The host's cached `api.source` (= the iframe's `contentWindow`) then refers to the **first**, now-discarded `Window`, and every subsequent `postMessage` from `src/api/postMessage.js` — including the retried `requestInitialize` and the queued `sendCurrentTargetLanguage` / `sendCurrentParsedContent` — is swallowed by that defunct window. The new editor session in the iframe registers its listener but never sees a single message from the host, so the editor sits empty. Fixed by (a) re-resolving `document.getElementById('i18next-editor-iframe')?.contentWindow` on every `sendMessage` and clearing `api.initialized` when the source changes under us, (b) restoring the `repeat` retry budget on every fresh `requestInitialize` cycle (it was a module-scoped `let` that stayed negative after the first cycle exhausted it), and (c) wiping `api.source` / `api.initialized` / `api.initInterval` inside the iframe `load` callback in `src/process.js` so each load (initial or re-navigation) triggers a clean handshake.

### 4.0.23

- fix `isInIframe` incorrectly evaluating to `true` in Node 20+ SSR builds (Gatsby, Next.js, Astro, Nuxt, etc.). `src/utils.js`'s module-level iframe detection ran `self !== top` inside a try/catch that historically threw `ReferenceError` in Node, leaving the safe default. Since Node 20 added `self` as an alias for `globalThis` (with `top` still `undefined`), `self !== top` evaluates to `true` without throwing — making locize wrongly conclude it is running inside the Locize editor iframe during the SSR render pass. The check now runs only when `typeof window !== 'undefined'`; a thrown `top` access (cross-origin parent) is still treated as "in iframe", preserving the previous browser behaviour.

### 4.0.22

- fix InContext editor popup being draggable off-screen, making the title bar (and controls like "save") unreachable. `src/ui/popup.js` now clamps `top`/`left` during drag so the header row always stays within the viewport with a small grabbable margin on the sides. `src/api/handleRequestPopupChanges.js` applies the same clamp when restoring a previously stored position from `localStorage`, so users whose `locize_popup_pos` was saved off-screen in an earlier version auto-recover on reload (no more manual `localStorage` reset workaround).

### 4.0.21

Security release — all issues found via an internal audit. See published advisory [GHSA-w937-fg2h-xhq2](https://github.com/locize/locize/security/advisories/GHSA-w937-fg2h-xhq2).

- security: validate `event.origin` against the configured iframe origin (`getIframeUrl()`) at the top of the `window.addEventListener('message', …)` listener in `src/api/postMessage.js`. Prior to 4.0.21 the listener dispatched to registered handlers based only on attacker-controlled `event.data.sender` — any web page that could embed or be embedded by the locize-enabled host could invoke `editKey`, `commitKey`, `commitKeys`, `isLocizeEnabled`, `requestInitialize`, etc., against it. In combination with the `innerHTML`/`setAttribute` sinks in `handleEditKey`/`commitKeys`, this enabled cross-origin DOM XSS; via `isLocizeEnabled`, attackers could hijack `api.source`/`api.origin` and redirect all outgoing messages (CWE-346, CWE-79). The check is computed once at message time and uses the already-existing `getIframeUrl()` so custom environments (development/staging) continue to work ([GHSA-w937-fg2h-xhq2](https://github.com/locize/locize/security/advisories/GHSA-w937-fg2h-xhq2))
- security (defence-in-depth): harden the `editKey` handler in `src/api/handleEditKey.js`. On `attr:` writes, reject event-handler names (`on*`), `style`, and `javascript:` / `data:` / `vbscript:` / `file:` URLs on `href`/`src`/`action`/`formaction`/`xlink:href`. On `html` writes, parse the translation through a throwaway `DOMParser` document, strip `<script>`/`<iframe>`/`<object>`/`<embed>`/`<link>`/`<meta>`/`<base>`/`<style>` elements along with all event-handler attributes and dangerous URL schemes, then assign the sanitised result to `innerHTML`. Legitimate translation formatting (`<b>`, `<em>`, `<strong>`, `<a href="https://…">`, etc.) is preserved.
- security (defence-in-depth): reject malformed `containerStyle.height` / `.width` values in `src/api/handleRequestPopupChanges.js`. Values must match a strict CSS-length pattern (e.g. `420px`, `50%`, `12em`); anything carrying a semicolon, `url(…)`, `calc(…)` chain, or arbitrary property-injection escape is dropped. Prevents CSS-injection escapes from the attacker-controlled popup-resize payload.
- chore: ignore `.env*` and `*.pem`/`*.key` files in `.gitignore`

### 4.0.20

- fix InContext editor not detecting translated text with trailing whitespace or line breaks (e.g. Angular templates where `{{ 'key' | i18next }}` is followed by a newline before the closing tag). The subliminal marker detection now fully trims template whitespace before checking.

### 4.0.19

- fix InContext editor not detecting translated text with leading whitespace (e.g. Angular templates with icon siblings: `<h4><mat-icon>icon</mat-icon> {{ 'key' | i18next }}</h4>`). The subliminal start marker check now handles leading template whitespace.

### 4.0.18

- fix InContext editor highlights appearing on top of modals and overlays. Uses `document.elementFromPoint()` to detect when a translated element is visually covered and suppresses the highlight.

### 4.0.17

- fix InContext editor not detecting translated text set via textContent/text interpolation (e.g. Angular `{{ 'key' | i18next }}`, loc-i18next, Vue `{{ $t('key') }}`). The MutationObserver for characterData changes now correctly resolves text nodes to their parent element before parsing.

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
