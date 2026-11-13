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
| `src/app/lib/consent.ts` | Storage key/values and the inline `<head>` bootstrap that queues the denied consent default and restores a stored choice. |
| `src/app/components/SiteDocument.tsx` | Renders the bootstrap in `<head>` and loads gtag.js with `strategy="lazyOnload"`. |
| `src/app/components/CookieConsent.tsx` | Spanish banner: persists `accepted`/`rejected` and sends the runtime consent update. |

`GoogleAnalytics.tsx` (the unused component pair that contained a second,
unused initialization path) has been removed.

## The bootstrap

`consentBootstrapScript` is inlined in `<head>`, right after the theme
bootstrap, so it runs before the GA loader and before hydration:

```js
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',
  ad_user_data:'denied',ad_personalization:'denied'});
try{if(localStorage.getItem('cookie-consent')==='accepted')
  gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
```

- Four consent keys are declared because Consent Mode v2 expects all of them.
  The site runs no ads, so ad-related keys are declared but never granted.
- Only the exact stored value `accepted` grants analytics. Absent, empty,
  `rejected`, stale, or corrupted values all stay denied.
- `window.gtag` is defined here so a banner click made before gtag.js arrives
  queues its update in `dataLayer` instead of being dropped.
- If local storage cannot be read, the `try` block fails and analytics stays
  denied.

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
4. Seed a `_ga` cookie by hand plus `cookie-consent = 'rejected'`, reload →
   check whether the legacy cookie survives (see below).

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

- **No way to withdraw consent.** The banner is hidden once a choice is
  stored, so a visitor who accepted cannot change their mind except by clearing
  browser data. A "change my cookie choice" link is a follow-up.
- The banner copy and legal pages are Spanish-only, and the privacy policy has
  no cookie section yet. Copy changes are out of scope for this setup.
