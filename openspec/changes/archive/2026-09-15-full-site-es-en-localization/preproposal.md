# SDD Pre-Proposal State: full-site-es-en-localization

```yaml
schema: gentle-ai.sdd-preproposal/v1
revision: 4
change: full-site-es-en-localization
exploration:
  outcome: complete
  openspec_reference: openspec/changes/full-site-es-en-localization/exploration.md
  engram_reference: sdd/full-site-es-en-localization/explore
research:
  selected: true
  request:
    lanes:
      - Next.js 16 static-export localization, metadata, sitemap, and routing constraints
      - Locale-correct static-export 404 behavior on Hostinger
      - next-intl support for unprefixed-default static export without middleware
    source_classes:
      - documentation
      - open-web
  admission:
    required_schema: gentle-ai.sdd-research-capability/v1
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
  outcome: blocked
  openspec_evidence_reference: openspec/changes/full-site-es-en-localization/research.md
  engram_evidence_reference: sdd/full-site-es-en-localization/research
  evidence_revision: 4
  unresolved_questions:
    - All selected questions remain unsupported in this revision because evidence capability admission failed.
product_decisions:
  status: pending
  decisions: []
proposal_ready: false
blockers:
  - Selected research is blocked because the executor's authoritative documentation and open-web evidence grants contain no admitted providers.
  - Product decisions remain pending and are owned by the orchestrator.
persistence:
  mode: hybrid
  expected_revision: 4
  parity_required: true
recovery:
  required: true
  action: Re-enter selected research with authoritative non-empty documentation and open-web grants, complete the selected official-source retrieval, and write a new positive revision to both stores before proposal admission.
  retained_intent: Complete only the three selected Next.js, Hostinger, and next-intl research lanes; record authoritative URLs and retrieval context; distinguish direct documentation from architectural inference; do not implement code or make product decisions.
```
