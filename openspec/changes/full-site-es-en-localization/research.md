# SDD Research: full-site-es-en-localization

```yaml
schema: gentle-ai.sdd-research/v1
revision: 4
change: full-site-es-en-localization
selected: true
outcome: blocked
requested_at: 2026-09-13
resumed_at: 2026-09-14
questions:
  - id: Q1
    text: Official Next.js 16 evidence for static export with locale-specific root layouts, unprefixed default Spanish routes, /en mirrors, html lang, metadata alternates and canonical hreflang, sitemap localization, and middleware or dynamic-routing constraints.
    status: unsupported
  - id: Q2
    text: Evidence-backed options for locale-correct 404 behavior in a static export deployed to Hostinger, including what Next.js emits and what cannot be solved without server routing.
    status: unsupported
  - id: Q3
    text: Whether next-intl supports the exact unprefixed-default plus static-export shape without middleware, distinguishing documented support from inference.
    status: unsupported
admission:
  required_schema: gentle-ai.sdd-research-capability/v1
  supplied_schema_name: gentle-ai.sdd-research-capability
  supplied_schema_version: 1
  admitted: false
  requested_grants:
    documentation:
      allowed: true
      providers:
        - context7
    open-web:
      allowed: true
      providers:
        - webfetch
  observed_exact_grants:
    documentation:
      allowed: false
      providers: []
    open-web:
      allowed: false
      providers: []
  denial_reasons:
    - The executor evidence grant for documentation declares no admitted providers.
    - The executor evidence grant for open-web declares no admitted providers.
    - A user-supplied capability declaration cannot override the executor's authoritative evidence grants.
sources: []
validated_claims: []
documented_conclusions: []
inferences: []
contradictions: []
uncertainty:
  - No source-backed claims are admitted in this revision because both requested evidence classes were denied before retrieval.
freshness:
  status: not_assessed
  details:
    - Source retrieval did not begin after capability admission failed.
product_choices:
  authority: orchestrator
  status: pending
  choices: []
recovery:
  required: true
  action: Re-enter this phase only after the executor receives authoritative non-empty documentation and open-web provider grants, then retrieve the selected official sources and write a new positive revision to both stores.
  retained_intent: Complete only the three selected Next.js, Hostinger, and next-intl research lanes; record authoritative URLs and retrieval context; distinguish direct documentation from architectural inference; do not implement code or make product decisions.
```
