## Purpose

Enable multilingual answers from approved iJAC knowledge with handoff.

## ADDED Requirements

### Requirement: Hybrid
Chatbot MUST prioritize safety/reset, active flow, quotation/support/contact, existing answers, AI, then unknown. AI MUST NOT mutate state or receive transcripts.
#### Scenario: Open
- GIVEN an active quotation flow and unmatched input
- WHEN sent
- THEN state is preserved until resume

### Requirement: Contract
API MUST accept one question and supported language, without extra fields, history, attachments, or streaming. It MUST reject invalid method, type, size, JSON, or origin.
#### Scenario: Extra
- GIVEN a request containing a transcript or extra field
- WHEN processed
- THEN it is rejected without a provider call

### Requirement: Governance
Knowledge MUST be versioned, curated, alias-supported, and identified by stable IDs. Entries/URLs require owner approval and site-change reapproval. URLs MUST match `https://ijac.com.ar/...`.
#### Scenario: Unapproved
- GIVEN an entry changed without approval
- WHEN retrieved
- THEN it is unavailable as evidence

### Requirement: Retrieval
Retrieval MUST lexically score approved content, return bounded top-K evidence above threshold, and MUST NOT call the provider below threshold.
#### Scenario: Unrelated
- GIVEN no entry meets the threshold
- WHEN asked
- THEN unknown/handoff returns without a provider call

### Requirement: Output
The provider MUST receive only question, language, and evidence. The API MUST validate output, status, answer, language, and source IDs; unknown IDs/URLs, malformed output, unsupported claims, and injection MUST fail closed.
#### Scenario: Injection
- GIVEN a request ignores evidence or supplies a conflicting price
- WHEN generated
- THEN no ungrounded claim returns

### Requirement: Language
Spanish, English, and Portuguese cards MUST preserve language and MUST NOT expand names, prices, hours, qualifiers, or evidence.
#### Scenario: Paraphrase
- GIVEN a Portuguese paraphrase of approved content
- WHEN matched
- THEN the Portuguese answer is evidence-limited

### Requirement: Presentation
Supported cards MUST show a relevant approved iJAC link when available and MUST NOT fabricate or emit unallowlisted links. Unknown/failure cards MUST offer WhatsApp/contact and use: ES “No encontré información aprobada para responder con seguridad. Escríbenos por WhatsApp.” EN “I could not find approved information to answer safely. Contact us on WhatsApp.” PT “Não encontrei informação aprovada para responder com segurança. Fale conosco pelo WhatsApp.” Failure MUST be distinct in telemetry.
#### Scenario: Invalid
- GIVEN an unapproved source returns
- WHEN checked
- THEN localized unknown/failure has contact and no link
#### Scenario: No URL
- GIVEN supported evidence has no approved URL
- WHEN rendered
- THEN it remains safe with no source link

### Requirement: Privacy
Prompts, answers, transcripts, raw IPs, provider payloads, and secrets MUST NOT be retained/logged. Approved aggregates MUST be retained no longer than 30 days and MUST be deleted/expired afterward; fields are outcome, source IDs, language, latency, error category.
#### Scenario: Inspection
- GIVEN any request
- WHEN checked
- THEN only approved aggregate fields appear

### Requirement: Controls
The API MUST enforce quotas, kill switch, timeout, one retry, and localized fallback for timeout, 429, 5xx, connection failure, model removal, invalid output, origin rejection, or validation failure. Secrets MUST be server-only.
#### Scenario: Quota
- GIVEN quota exhaustion or active kill switch
- WHEN submitted
- THEN no provider call occurs and handoff returns

### Requirement: Accessibility
Async state, cards, sources, and contact MUST be keyboard accessible, announced without focus loss, retain context, support Escape, show focus, and avoid traps. A flag MUST restore deterministic-only behavior; API rollback is independent.
#### Scenario: Completion
- GIVEN a keyboard submission
- WHEN complete
- THEN announced focus remains predictable

### Requirement: Gates
Release MUST be blocked until owner/copy approval, Groq policy, current free structured-output model, DNS/origins, preview smoke, secret scan, and redacted logs pass.
#### Scenario: Missing
- GIVEN model or log evidence is absent
- WHEN promotion starts
- THEN promotion is blocked

## Non-goals

CMS/auth/CRUD/database; embeddings/vector DB; web search; general knowledge; multi-turn context; streaming; voice; attachments; redesign; migration.
