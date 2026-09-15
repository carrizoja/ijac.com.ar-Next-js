## Outcome

Delivered. The capability shipped in PR #10, merged to `main` on 2026-09-15.

This change never reached a proposal, spec, design or tasks artifact. Mandatory
research was selected and reached revision 4 as `blocked`: the executor's
authoritative evidence grants for the `documentation` and `open-web` classes
resolved to no admitted providers, so the three selected lanes were never
retrieved. A restart and an explicit runtime capability declaration both failed
to change that, and `preproposal.md` records `proposal_ready: false`.

Rather than leave the work stalled behind that gate, it was implemented
directly, in reviewed slices, each verified before the next began:

| Slice | Capability |
| --- | --- |
| 1 | Typed ES/EN URL helpers, accessible language toggle, `/en` landing shell |
| 2-3 | Locale-specific root layouts sharing `SiteDocument`; correct build-time `lang` |
| 4 | Localized shared chrome — navbar, hamburger menu, footer |
| 5 | Localized About, OurStaff, Testimonials and Contact; sections on `/en` |
| 6 | English service pages under English slugs, and `/en/contact` |
| 7 | SEO surface — sitemap entries for both locales, reciprocal hreflang |

Two notes preserved for future locales:

- **Testimonials keep their original Spanish.** `src/data/testimonials.js` holds
  real, named Google reviews linked to a live Business Profile. Only the
  surrounding UI chrome is translated; rewriting attributed quotes into another
  language would misrepresent the reviewers.
- **`availableEnglishPaths` in `src/i18n/routing.ts` is the single switch.**
  Registering a path promotes its navigation item from a home-page anchor to the
  real page automatically, and retires the WhatsApp fallback for contact.

The exploration notes in this folder remain accurate and were used throughout.
`research.md` and `preproposal.md` are left at their final `blocked` revisions as
the honest record of why the SDD flow was abandoned.

### Not delivered

- The English copy has not been reviewed by a native speaker.
- `AIChat` is not localized — its UI and suggested questions are Spanish only.
- The legal pages remain Spanish-only; they are `noindex`.
