### 4.5.1

- fix: `ssoIdentifier` can now also be set in the i18next `editor` options (`editor: { ssoIdentifier }`). The i18next adapter only copied `projectId` and `version` from the `backend`/`editor` blocks into the plugin config, so setups that register the plugin without options - locizify, or a plain `locizePlugin` - had no way to pass the option except a script attribute on an element with `id="locize"`. A plugin option or script attribute still takes precedence.

### 4.5.0

- feat: `ssoIdentifier` option for teams that sign in to locize through SAML SSO. Without a locize session the editor popup signs the user in through a small top-level locize window, and an SSO user had to type their email there first so locize could find their provider. With `ssoIdentifier` set (the `<id>` of the `https://www.locize.app/login/<id>` link) the popup passes it to the editor as `?sso=<id>`, and the sign-in window goes straight to that identity provider - with an active session at the provider, one click and no typing. Accepted as a plugin option, a `startStandalone` option or an `ssoidentifier` script attribute, typed in `index.d.ts`/`index.d.mts`. An editor that does not know the parameter simply ignores it.

### 4.4.0

- feat: opt-in shadow DOM support via the `shadowDOM` option ([#251](https://github.com/locize/locize/pull/251)). A shadow root is a boundary for two things at once: `walk` follows `childNodes`, which stops at it, and a `MutationObserver` on `document.body` is never notified about anything inside one, not even with `subtree: true` - so each root has to be observed on its own, including the ones attached *after* the editor started, which is the normal case for components that mount later. With the option on, `walk` descends into open shadow roots, every root present at startup is observed (nested included) and `Element.prototype.attachShadow` is hooked for later ones, store eviction switches from `document.body.contains` to `isConnected` (which holds across a shadow boundary), and the occlusion check drills through nested roots instead of stopping at the shadow host and concluding every shadow node was covered by its own host. Accepted as a plugin option, a `startStandalone` option or a `shadowdom` script attribute, typed in `index.d.ts`/`index.d.mts`. **Off by default** - with the option off every new path short-circuits on the same flag, the `attachShadow` hook is never installed, and behaviour is unchanged.
- fix: keys behind the InContext editor popup stayed highlightable ([#249](https://github.com/locize/locize/pull/249)). `data-i18next-editor-element` marks two very different things - our own hover overlays (the highlight box, the ribbon), which sit on top of the very node they belong to, and the editor chrome (the popup, its iframe, its drag overlay), which really does cover the page. `isOccluded` treated both as non-occluding, so moving the cursor near the panel highlighted the text underneath it and an existing highlight was not cleared while the cursor sat on the panel. Our overlays are now matched by class (`.i18next-editor-highlight`, `.i18next-editor-button-container`, `.i18next-editor-button`) and keep the previous behaviour; anything else carrying the marker counts as an occluder.
- fix: an element that reaches under an overlay is highlightable again on the part you can actually see. The occlusion test looks at the element's centre point, so a wide table row running under the popup - or under a sticky sidebar - counted as completely hidden even where it was plainly visible. When the centre is covered the check is now repeated at the cursor, but only while the cursor is inside that element: it can rescue an element the centre test rejected and never occlude one it cleared, so the 5px/10px proximity tolerance keeps working for everything the cursor is not on.
- fix: the cursor resting on the editor popup could still highlight a key underneath it, even after the marker fix above. That test asks whether each element's **centre** is covered, so a full-width paragraph that the popup only partly covers has its centre out in the open and was highlighted anyway - the original symptom, not fully cured. The cursor position is now checked once per recompute: while it sits on the popup or the minimized ribbon, hover highlights are cleared and nothing new is drawn (our own hover overlays excluded, so hovering a ribbon still keeps its highlight). That chrome is matched by id and class rather than by `data-i18next-editor-element`, because host applications set that attribute on their own containers too - the locize app marks its whole `#root` with it so an embedding editor skips it - and treating those as chrome would suppress highlighting across an entire host page. Because the editor iframe is cross-origin, no `mousemove` from inside it ever reaches the host page - a highlight drawn on the last event before the pointer crossed that boundary would otherwise stay for as long as the cursor was in the editor - so `mouseover`, which does still fire on the iframe element itself, is wired to the same check.
- fix: hover highlights were only recomputed on `mousemove`, so scrolling with the mouse held still left them behind ([#250](https://github.com/locize/locize/pull/250)). A highlight box is positioned in page coordinates, so it scrolled away together with the content and nothing ever cleared it. Mouse tracking now runs the same distance check on `scroll` - registered in the capture phase, because `scroll` does not bubble and the page often scrolls in a container rather than in the document - rebuilding the mouse page position from its last viewport position plus the current scroll offset. The off-screen early return no longer skips the reset either, so an item that scrolls out of view drops the highlight it was still holding. A selected key's box is deliberately left alone: a selection outlives scrolling.
- fix: highlight boxes drifting off their content ([#252](https://github.com/locize/locize/pull/252)). A box is positioned in page coordinates once, when it is created, and nothing moved it afterwards - so content that shifted without the page scrolling (a container scrolling while `window.scrollY` stays 0, a reflow above it) left the overlay behind on the spot the text had vacated. The worst case was a selected key, whose box no distance rule is allowed to clear, so the drift was permanent until the selection changed. The existing elements are now realigned **in place** rather than torn down and re-created, which would flicker on every recompute tick: the geometry moved out of `HighlightBox` into `positionHighlightBox`, the floating-ui placement out of `highlight()` into `positionRibbonBox`, and `repositionOverlays` realigns box and ribbon whenever top, left, width or height drifted by more than 1px. The ribbon is hidden while its node is off-screen - floating-ui's `shift()` would otherwise clamp it to the viewport edge, pointing at nothing - and re-placed when the node comes back. Page scrolling moves the rect and the scroll offset by the same amount, so it stays a no-op there and only real drift is corrected.
- fix: `startMouseTracking` leaked event listeners. It is called again on drag end, resize end, popup restore and `turnOn`, and each call built a fresh handler closure and bound it without unbinding the previous one - which `stopMouseTracking` could then no longer remove, since it only ever held the newest reference. It now unbinds before rebinding.
- chore: dependency maintenance and lint modernisation. Runtime deps moved up within range (`@babel/runtime` 7.29.7, `@floating-ui/dom` 1.8.0 - the ribbon positioning it drives was re-verified in a real browser). The deprecated `rollup-plugin-terser` was replaced by its maintained successor `@rollup/plugin-terser`, clearing a high-severity `serialize-javascript` advisory in the bundler; the emitted bundle is byte-for-byte identical. The lint stack moved from `eslint-config-standard` + eslintrc to **neostandard** with a flat `eslint.config.js` (matching `i18next-locize-backend`), which unblocked eslint 8 -> 9.39 and let `@typescript-eslint/*`, `eslint-config-standard`, `eslint-plugin-n`, `eslint-plugin-promise` and the deprecated `eslint-plugin-standard` be dropped entirely - one `npm run lint` now covers source and type definitions, and it also lints files the old `eslint ./src/*` never looked at. `typescript` 5.9 -> 6.0, `tsd` 0.29 -> 0.33, `cpy-cli` 5 -> 7, `@web/dev-server` 0.4 -> 1.0, `i18next` (demo) 26.4.0. `npm audit` on the package is clean.

### 4.3.1

- fix: highlight boxes and ribbons left behind in the DOM forever when a highlighted node leaves the document ([#248](https://github.com/locize/locize/pull/248)). `store.clean()` and `uninstrumentedStore.clean()`/`remove()` passed the item **id** to `resetHighlight`, which reads the overlay elements off the **item** (`item.highlightBox` / `item.ribbonBox`) — so the store entry was deleted but its boxes stayed at their last coordinates with nothing referencing them any more, accumulating on every framework re-render (React, Angular, Vue) that replaced a highlighted element. All call sites now pass the item, and with `ignoreSelected: false`, so a selection highlight doesn't outlive its node either.
- fix: `resetHighlight(undefined, …)` threw `Cannot destructure property 'id' of 'item' as it is undefined` and aborted the whole parse run when `uninstrumentedStore.remove` was called with an id derived from a `null` `node.parentElement`; `remove` now looks the item up and skips when there is none.
- fix: `uninstrumentedStore.clean()` was exported but never called — uninstrumented entries whose node had left the document were never evicted, piled up in the store and kept being reported to the editor as uninstrumented text. `parseTree` now runs it alongside `store.clean()`.

### 4.3.0

- feat: navigate-vs-edit mode, also exported as `turnOn()` / `turnOff()` from the package root (typed in `index.d.ts`/`index.d.mts`) so integrators can toggle it from their own UI. The editor can pause the InContext script via the (re-introduced, now actually implemented) `turnOff` / `turnOn` messages: while paused, hover highlighting and click interception stop and existing highlights are cleared, so the page behaves like a normal website and multi-step flows can be navigated between edits; content parsing keeps running so the on-page key list stays fresh. Maximizing the minimized popup no longer resumes highlighting while paused.
- feat: click-to-locate. When the editor selects keys (`selectedKeys`), the page now scrolls the first matching element into view (smooth, centered) when it is off-screen, in addition to the existing selection highlight.
- feat: touch/tablet support for the popup: drag and resize now use pointer events with `touch-action: none`, so they work with touch and pen input as well as mouse.
- feat: accessibility basics on the script UI: the minimized ribbon and the minimize control are keyboard-operable buttons with aria-labels; the editor iframe carries a title.
- fix: global parse backoff on high-churn pages. The per-element re-render suppression could not catch pages where mutations keep hitting different elements (animations, tickers); beyond 10 parses within 10 seconds, parsing is now held to ~1/second (mutated elements keep accumulating and are processed on the next run).

### 4.2.2

- fix: the InContext editor stayed on the dashboard (no project opened) when a host configured both an `editor` block and a `backend` block and put `projectId` only in `backend` - e.g. locizify with `editor: { bodyStyle: '...' }` for presentation and `backend: { projectId, version }` for the connection. `getLocizeDetails` picked `i18n.options.editor || i18n.options.backend`, so a truthy presentation-only `editor` block shadowed `backend` entirely and dropped `projectId`/`version`. The two blocks are now merged (`{ ...backend, ...editor }`): editor fields still win, but `projectId`/`version` fall back to `backend`. Surfaced by the 4.2.0 missing-projectId startup `console.error`.

### 4.2.1

- fix: the InContext **view** (your website embedded as an iframe inside the locize app, "mode B") could never connect since 4.0.21. The security release's origin validation only accepted the popup editor origin (`incontext.locize.app`, resp. `localhost:3003` in development) — but in the InContext view the editor messages arrive from the main locize app (`www.locize.app` / `locize.app`, `dev.locize.app` on staging, `localhost:3000` in development), so every `isLocizeEnabled` handshake ping was silently dropped and the view showed an empty key list. Found within hours of 4.2.0's diagnostics going live: the new `locize-debug` mode printed `dropped editor message from unexpected origin http://localhost:3000 expected http://localhost:3003` and the new editor-side connection banner made the dead handshake visible. `src/vars.js` now exposes `getEditorOrigins()` — a **fixed allowlist** per environment covering both the popup editor origin and the main-app origins hosting the InContext view — and `src/api/postMessage.js` validates `e.origin` against that list. No wildcard, no attacker-controllable entries; the security property of [GHSA-w937-fg2h-xhq2](https://github.com/locize/locize/security/advisories/GHSA-w937-fg2h-xhq2) is preserved.

### 4.2.0

- feat: make the minimized InContext button (the round "ribbon") customizable. Its styles moved from an inline `style` attribute to an injected stylesheet rule on the new stable class `locize-incontext-ribbon`, so integrators can reposition/restyle it with plain CSS (no `!important` needed). A `ribbonPosition: 'bottom-right' | 'bottom-left'` option switches the built-in corner and is accepted by `locizeEditorPlugin(...)`, `startStandalone(...)` and as a `ribbonposition` attribute on the `<script id="locize">` tag; typed in `index.d.mts`.
- fix: minimized ribbon nearly invisible on saturated page backgrounds (e.g. blue sites). The previous `rgba(249, 249, 249, 0.2)` background was ~80% transparent, leaving little more than the blur circle; it is now `rgba(249, 249, 249, 0.8)`, and `-webkit-backdrop-filter` was added so Safari gets the same frosted look.
- feat: surface InContext connection failures instead of a silent blank popup. A single 15-second watchdog in `src/process.js` covers every previously-silent failure path — editor iframe blocked by the page CSP (`frame-src`) or an adblocker, user not logged in at locize, editor crash, origin mismatch: it logs a `console.error` naming the likely causes and renders a warning banner inside the popup ("Could not connect to the locize editor…"). The banner is removed again if a late `confirmInitialized` still arrives (`src/api/handleConfirmInitialized.js`). A missing `projectId` now logs a `console.error` at startup instead of the editor quietly finding nothing. The README gained a matching troubleshooting section.
- feat: opt-in diagnostics. `localStorage.setItem('locize-debug', 'true')` (or a `?locizeDebug=true` query parameter) enables verbose console logging: startup config + iframe URL, the handshake, every queued/sent/received postMessage, the handshake give-up, and editor-frame messages dropped due to an unexpected origin. Replaces the previously commented-out `console.warn` calls in `src/api/postMessage.js`; silent by default.
- fix: the `pendingMsgs` outbox in `src/api/postMessage.js` is now capped at 100 entries. Previously, when the editor never connected, every parse/language-change kept pushing messages into a queue that was never drained or bounded.
- chore: removed the dead `turnOn`/`turnOff` postMessage handler stubs (`src/api/_handleTurnOn.js` / `_handleTurnOff.js`) — nothing ever sent these messages and the handlers called `api.turnOn()`/`api.turnOff()` which were never defined — and removed the unbounded per-mousedown z-index increment in `src/ui/popup.js` (with a single popup it only competed with itself; the popup keeps its fixed `z-index: 100000`).

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
