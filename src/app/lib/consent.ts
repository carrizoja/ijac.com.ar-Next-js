export type ConsentChoice = "accepted" | "rejected";

/** The banner writes this key; the head bootstrap reads the same one. */
export const CONSENT_STORAGE_KEY = "cookie-consent";

export const CONSENT_ACCEPTED: ConsentChoice = "accepted";
export const CONSENT_REJECTED: ConsentChoice = "rejected";

/** `_ga` and the per-stream `_ga_<id>` cookies, but not `_gid`. */
const GA_COOKIE_NAME = "/^_ga(_|$)/";

/**
 * Assembled from literal parts plus token replacement, never with `${…}`
 * inside a concatenated string: the production compiler (Turbopack/SWC)
 * mis-folds a `+` chain that interpolates a constant mid-string and silently
 * drops the text after the interpolation — it shipped a truncated bootstrap
 * where `next dev` was fine. Literal parts have nothing to mis-fold, and the
 * replacements run at module load.
 */
const CONSENT_SCRIPT_PARTS = [
  "window.dataLayer=window.dataLayer||[];",
  "function gtag(){dataLayer.push(arguments);}",
  "window.gtag=window.gtag||gtag;",
  "gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',",
  "ad_user_data:'denied',ad_personalization:'denied'});",
  "(function(){",
  "var c=null;",
  "try{c=localStorage.getItem('__CONSENT_KEY__')}catch(e){}",
  "if(c==='__CONSENT_ACCEPTED__'){",
  "gtag('consent','update',{analytics_storage:'granted'});return}",
  "var h=location.hostname,ds=[h],p=h.split('.');",
  "if(!/^[\\d.]+$/.test(h)){",
  "for(var i=1;i<p.length-1;i++)ds.push(p.slice(i).join('.'))}",
  "var cs=document.cookie.split('; ');",
  "for(var j=0;j<cs.length;j++){",
  "var n=cs[j].split('=')[0];",
  "if(__GA_COOKIE__.test(n)){",
  "for(var k=0;k<ds.length;k++){",
  "document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain='+ds[k]}",
  "document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'}",
  "}})();",
].join("");

/**
 * Inlined into <head> and run before Google Analytics, synchronously, so the
 * denied default is queued before any hit can be sent. Google Consent Mode v2
 * "advanced" keeps gtag.js loaded and sends cookieless pings; with storage
 * denied it sets no `_ga`/`_ga_*` cookies, which is the guarantee this site
 * makes to a visitor who rejected.
 *
 * Only an exact stored "accepted" grants analytics. Anything else — absent,
 * stale, corrupted, or unreadable — stays denied, so the failure mode is
 * "no cookies". Defining `window.gtag` here is what lets a banner click made
 * before gtag.js arrives queue its update in `dataLayer` instead of vanishing.
 *
 * Consent Mode stops new cookies but does not remove the ones written while
 * this site ran unguarded, so a non-accepted visitor also gets leftover
 * `_ga`/`_ga_*` expired here, before gtag.js loads. The cookie name is tried
 * against the current host and every parent suffix a browser will accept, so
 * a cookie shared across `www.example.com` and `example.com` is removed too.
 *
 * Kept as a single-line string so it is testable without rendering the
 * document, mirroring `themeBootstrapScript`.
 */
export const consentBootstrapScript = CONSENT_SCRIPT_PARTS.replace(
  "__CONSENT_KEY__",
  CONSENT_STORAGE_KEY,
)
  .replace("__CONSENT_ACCEPTED__", CONSENT_ACCEPTED)
  .replace("__GA_COOKIE__", GA_COOKIE_NAME);
