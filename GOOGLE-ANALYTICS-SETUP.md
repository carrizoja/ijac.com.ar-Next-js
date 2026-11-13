# Google Analytics and Consent Mode

Google Analytics runs on `G-8NYPRQK16F` with Google Consent Mode v2 in
**advanced** mode: the tag loads for every visitor, but analytics storage stays
denied until the visitor accepts the cookie banner. With storage denied,
gtag.js sets no `_ga`/`_ga_*` cookies.

Scope note: advanced mode still sends **cookieless pings** to Google. The
guarantee is "no analytics cookies for a visitor who declined", not "no data
leaves the browser before consent". A stricter basic-mode setup would be a
separate change.

## Where it lives

| File | Responsibility |
| --- | --- |
| `src/app/lib/consent.ts` | Storage key/values, the withdrawal event, and the inline `<head>` bootstrap that queues the denied consent default, restores a stored choice, and exposes the cookie cleanup. |
| `src/app/components/SiteDocument.tsx` | Renders the bootstrap in `<head>` and loads gtag.js with `strategy="lazyOnload"`. |
| `src/app/components/CookieConsent.tsx` | Spanish banner: persists `accepted`/`rejected`, sends the runtime consent update, and handles withdrawal. |
| `src/app/components/Footer.tsx` | Renders the `Configurar cookies` / `Cookie settings` control that withdraws consent. |
| `src/i18n/chrome/footer.ts` | Bilingual label for that control. |

`GoogleAnalytics.tsx` (the unused component pair that contained a second,
unused initialization path) has been removed.

## The bootstrap

`consentBootstrapScript` is inlined in `<head>`, right after the theme
bootstrap, so it runs before the GA loader and before hydration. Its shape:

```js
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',
  ad_user_data:'denied',ad_personalization:'denied'});
(function(){
  function expireGaCookies(){ /* expires _ga/_ga_* on host and parent domains */ }
  window.__ijacExpireAnalyticsCookies=expireGaCookies;
  try{if(localStorage.getItem('cookie-consent')==='accepted'){
    gtag('consent','update',{analytics_storage:'granted'});return;}}catch(e){}
  expireGaCookies();
})();
```

- Four consent keys are declared because Consent Mode v2 expects all of them.
  The site runs no ads, so ad-related keys are declared but never granted.
- Only the exact stored value `accepted` grants analytics. Absent, empty,
  `rejected`, stale, or corrupted values all stay denied.
- `window.gtag` is defined here so a banner click made before gtag.js arrives
  queues its update in `dataLayer` instead of being dropped.
- If local storage cannot be read, the `try` block fails and analytics stays
  denied.
- `window.__ijacExpireAnalyticsCookies` is the **only** implementation of the
  expiry loop. It is assigned before the stored choice is read, so it exists for
  accepted visitors too — that is what lets a withdrawal clean up cookies that a
  granted consent wrote. Do not reimplement the loop in TypeScript: an inline
  script cannot import it, and two copies drift.

## Loading the tag

The reduced inline init no longer defines `dataLayer` or `gtag`:

```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-8NYPRQK16F"
  strategy="lazyOnload"
/>
<Script id="google-analytics" strategy="lazyOnload">
  {`
    gtag('js', new Date());
    gtag('config', 'G-8NYPRQK16F', {
      page_title: document.title,
      page_location: window.location.href,
    });
  `}
</Script>
```

This is deliberately fail-closed. If the head bootstrap is blocked (CSP, a
privacy extension, disabled inline scripts), `gtag` is undefined here and the
init throws — GA never configures. Do not add a fallback that redefines
`dataLayer`/`gtag` in this block: it would initialize GA with no consent
default, which is the bug this setup exists to prevent.

## Expected numbers

Visits from rejected and not-yet-answered browsers no longer set cookies, so
GA4 receives cookieless pings for them. Raw visit/session counts will drop
compared with the previous setup; accepted sessions still report normally.

## Withdrawing consent

The footer shows `Configurar cookies` (Spanish) or `Cookie settings` (English).
Activating it:

1. queues a consent `update` denying `analytics_storage`, before anything else,
   so a hit processed afterwards cannot write the cookies back;
2. calls `window.__ijacExpireAnalyticsCookies()` to remove `_ga`/`_ga_*`;
3. removes `cookie-consent` and `cookie-consent-date`;
4. shows the banner again, without a reload, so the visitor can choose — the
   same banner is also how they accept again.

Accepting from the restored banner grants storage immediately, but GA writes
cookies on the next pageview: the current page's hit was already sent
cookieless before the withdrawal. A verified run showed `_ga` returning on the
next load, which is the expected GA behavior rather than a bug in this code.

The footer button dispatches `CONSENT_WITHDRAW_EVENT` (`ijac:consent-withdraw`)
on `window`; `CookieConsent` listens for it. The two components are siblings
under a server component, so an event is the whole contract. Withdrawal also
overrides the legal-page banner suppression: on `/terminos-y-condiciones` and
`/politica-de-privacidad` the banner stays hidden on a first visit but appears
after an explicit request, so the control never looks broken. Rejecting from the
banner triggers steps 1 and 2 as well, so `Rechazar` after an earlier acceptance
removes those cookies too.

If the head bootstrap is blocked, withdrawal still clears the choice and shows
the banner, but cannot expire cookies — a blocked bootstrap already leaves GA
outside this consent machinery, as described under *Loading the tag*.

## Verifying in a browser

Use `document.cookie`, not the DevTools cookie panel: the assertion is about
what the script wrote.

```js
document.cookie.split('; ').filter(c => /^_ga/.test(c)) // expect []
```

1. Clear storage, load a page → no `_ga` cookie; `dataLayer[0]` is the denied
   default.
2. Click "Aceptar Cookies" → `_ga` appears; GA4 Realtime shows the session.
3. Set `localStorage['cookie-consent'] = 'rejected'`, reload → no `_ga`, banner
   stays hidden, `analytics_storage` stays denied.
4. Seed a `_ga` cookie by hand plus `cookie-consent = 'rejected'`, reload → the
   seeded cookie is gone.
5. Accept, then click `Configurar cookies` in the footer → no `_ga` cookie,
   `localStorage['cookie-consent']` is `null`, and the banner is visible again.
   Accept from that banner → the choice is stored and `analytics_storage` is
   granted; `_ga` reappears on the **next page load**, not in the same session,
   because the current pageview was already sent cookieless.
6. Reload after step 5 (without choosing) → no `_ga`, banner shown again.
7. Open `/terminos-y-condiciones`, click `Configurar cookies` → the banner
   appears on the legal page.

## Legacy cookies from before Consent Mode

Visitors who declined while analytics ran unguarded may already hold `_ga`/
`_ga_*` cookies. Consent Mode stops new writes but **does not expire them**: a
hand-seeded `_ga` survived a rejected page load in a headless-Chrome check of
the static export. The bootstrap therefore expires any `_ga`/`_ga_*` cookie
before gtag.js loads, unless the stored choice is exactly `accepted`. The
expiry is attempted for the current host and every parent domain the browser
accepts, so a cookie shared across `www.ijac.com.ar` and `ijac.com.ar` is
removed too. `_gid` and unrelated cookies are left alone.

Build constraint: `consentBootstrapScript` is assembled from literal parts plus
token replacement, not with `${…}` interpolation inside a `+` chain. The
production compiler (Turbopack/SWC) mis-folds that pattern and shipped a
truncated script while `next dev` looked correct. If you edit the script, keep
the literal-parts shape and re-check the built `out/index.html`.

## Known gaps

- The banner follows the page locale (copy in `src/i18n/chrome/cookie-consent.ts`),
  but the legal pages it links to are Spanish-only, so English visitors land on
  Spanish text. The privacy policy has no cookie section yet.
- Withdrawal is a single action, not a preferences panel: the site has one
  optional category, so the restored banner is the whole preference UI.
- If the head bootstrap is blocked, GA neither receives a consent default nor
  can have its cookies expired from this site. Blocked inline scripts are a
  browser-level decision outside this setup's control.
