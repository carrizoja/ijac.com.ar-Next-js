# Design

## Context

See `proposal.md` — Why. The pieces already in place that shape this work:

- `src/app/lib/consent.ts` holds the consent constants and `consentBootstrapScript`, an inline `<head>` script rendered by `SiteDocument` before Google Analytics. It declares denied defaults, restores a stored `accepted`, and expires leftover `_ga`/`_ga_*` cookies for everyone else.
- The cookie-expiry loop lives inside that script string. It cannot call TypeScript: the script is inlined as text, and — since the Turbopack string-folding incident — it is assembled from literal parts joined with `.join("")`, never from `${…}` interpolation.
- `CookieConsent` is a client component mounted once per page, next to `Footer`, both children of `SiteDocument`. The banner renders `null` until it has decided to show, but the component itself is always mounted, so its effects run on every page.
- `Footer` already gets typed bilingual copy from `src/i18n/chrome/footer.ts`, and `usePathname()` gives it the locale.

`CookieConsent` and `Footer` are siblings with no shared parent state, and `SiteDocument` is a server component.

## Goals / Non-Goals

**Goals:**

- One control, one flow: withdraw → deny → remove cookies → forget the choice → banner returns. No second dialog, no new copy beyond the control's label.
- Reuse the existing cookie-expiry logic instead of shipping a second copy of it.
- Keep the banner's own copy and layout unchanged.

**Non-Goals:**

- Category-level preferences (analytics on, marketing off). The site only has one optional category; a toggle panel would be UI without a decision behind it.
- A consent audit log. Withdrawal is recorded as the absence of a choice, not as a third state.
- Changing the banner, the legal pages, or GA initialization.

## Decisions

### D1 — Withdrawing reopens the banner rather than resetting silently

Withdrawal clears the stored choice and re-shows the banner, so the visitor ends in the same state as a first visit and can accept again from the same control.

*Alternatives.* A preferences panel with an analytics toggle needs new UI, new copy, focus management and its own tests — a larger surface than the banner it configures, for a site with one optional category. A silent deny leaves the visitor with no obvious way back to accepting, so the loop stays half-closed.

### D2 — The footer control is a `<button>`, signalled to the banner with a DOM event

`Footer` calls `requestConsentWithdrawal()` from `lib/consent`, which dispatches `CONSENT_WITHDRAW_EVENT` on `window`; `CookieConsent` subscribes in an effect. The button is `type="button"`, not a link: it performs an action and must not navigate, so there is no route, no locale-pair obligation and no SEO surface.

*Alternatives.* A React context provider would need `SiteDocument` (a server component) to wrap both siblings in a new client provider — more plumbing for one signal. A global function registered by the banner would invert the dependency and fail silently if the banner were ever unmounted; the event degrades the same way, but a spy in `Footer`'s test proves the dispatch and the banner's test proves the handling, so the contract is covered from both ends.

### D3 — Cookie cleanup is defined once, in the head script, and exposed on `window`

The bootstraps's IIFE now declares `function expireGaCookies()` once, assigns it to `window.__ijacExpireAnalyticsCookies`, and calls it for non-accepted visitors. Withdrawal calls the same function through that global. The name is typed with `declare global` next to `CONSENT_WITHDRAW_EVENT`, and the call is optional-chained, so a blocked head script cannot throw from the footer control.

*Alternatives.* A TypeScript `expireAnalyticsCookies()` would be the natural home, but the inline script cannot import it, and reimplementing the host-plus-parent-domain loop in the component would give two expiry implementations that can drift — the exact failure this design avoids. Generating the component's copy from the same literal parts would require `eval`/`new Function`, which is a CSP problem and worse than one documented global.

*Accepted consequence.* If the head script is blocked entirely, withdrawal clears the stored choice and re-shows the banner but cannot expire cookies. That path already leaves Google Analytics outside this site's consent machinery, which is a pre-existing limitation, not one this change introduces.

### D4 — Withdrawal order: deny, expire, forget, reveal

1. `gtag('consent','update',{analytics_storage:'denied'})` — queued first, so any hit processed afterwards cannot write cookies back.
2. `window.__ijacExpireAnalyticsCookies?.()`.
3. Remove `cookie-consent` and `cookie-consent-date` inside `try/catch`; blocked storage is not an error for the visitor.
4. Set the banner's show/visible state and its legal-page override.

Denying before expiring is what makes step 2 stick; expiring before denying would let the next page-view hit recreate `_ga`. Clearing storage before the banner returns matters for the reload case, not the immediate one.

### D5 — An explicit withdrawal overrides the legal-page banner suppression

The banner stays hidden on `/terminos-y-condiciones` and `/politica-de-privacidad` so it cannot cover the text a visitor came to read. A click on the footer control is an explicit request, so it sets a `requested` flag that renders the banner there too. Without it, the control would appear broken on exactly the pages where a visitor is most likely to look for it.

### D6 — Rejecting also expires existing analytics cookies

`applyChoice` now expires `_ga`/`_ga_*` when the choice is `rejected`. Without it, an accepted visitor who reopens the banner and rejects keeps the cookies written while consent was granted — contradicting the spec's "present" wording. It costs one optional-chained call and makes both entry points to `rejected` behave identically.

### D7 — Copy lives in `src/i18n/chrome/footer.ts`

`cookieSettingsLabel` joins the existing `Record<Locale, FooterContent>`: `Configurar cookies` / `Cookie settings`. No new i18n mechanism, and `Footer.test.tsx` can assert both languages the same way it does for the other labels.

## Flow

```text
Visitor            Footer            lib/consent        CookieConsent         gtag.js / cookies
  |  click           |                   |                    |                       |
  |----------------->| requestConsentWithdrawal()             |                       |
  |                  |------- event ---->| dispatch on window |                       |
  |                  |                   |------------------->| handle withdrawal     |
  |                  |                   |                    |-- consent update ---->| denied
  |                  |                   |<---- __ijacExpireAnalyticsCookies --------| _ga* removed
  |                  |                   |                    |-- removeItem ---------| no stored choice
  |                  |                   |                    |-- show banner --------|
  |  banner returns  |                   |                    |                       |
  |<------------------------------------------------------------------------------- -|
```

## Risks / Trade-offs

- **The built bootstrap gets truncated again** → the script keeps the literal-parts + `.join("")` shape, and the task list re-greps `out/index.html`, `out/en/index.html` and `out/404.html` for the new function name and the closing braces after every edit.
- **The `window.__ijacExpireAnalyticsCookies` name is an implicit contract** between an inline string and a component → both sides are asserted in tests (the script defines it; the component calls it), and `consent.ts` documents it in one place with the typing.
- **The event silently does nothing if the banner is unmounted** → `SiteDocument` always renders it, and the banner's test proves the listener is registered on mount.
- **A visitor can withdraw from a legal page and land the banner over the text** → intended: the banner only appears there after an explicit request, and it can be dismissed with a choice.
- **Withdrawal while a GA hit is in flight** → the denial is queued before the expiry, so a hit processed after it is cookieless; a hit already sent may still have created a cookie, and the next withdrawal removes it. Re-verification in a real browser is part of the tasks.

## Migration Plan

No data migration: withdrawal removes keys and cookies, and the head script already denies any visitor without a stored acceptance.

1. Ship the bootstrap change and the footer control together — the control is useless without the exported cleanup function, and the browser check must exercise the real page.
2. Deploy with the existing `npm run deploy -- --live` path; verify the built bytes before upload, then the live origin's `document.cookie`.
3. Rollback: revert the commit and redeploy. Visitors who withdrew are simply back to "banner hidden, analytics denied", which is the pre-change behavior for them.
