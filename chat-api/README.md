# @ijac/chat-api

Isolated server deployable for the grounded chatbot. Deployed separately from the website to
`api.ijac.com.ar`. The website itself is a static export with no server runtime, so this is the
only place where a provider key or a KV credential may exist.

Operational procedures — DNS, rollback, kill switch, smoke checks — live in
[`../docs/chatbot-runbook.md`](../docs/chatbot-runbook.md).

## Boundary

```
Hostinger (static out/)                Vercel (api.ijac.com.ar)
┌────────────────────────────┐       ┌──────────────────────────────┐
│ AIChat.tsx  (browser)      │ POST  │ chat-api/  (Node runtime)    │
│ chatEngine.ts deterministic├──────▶│ envelope → gate → retrieval  │
│ chatApi.ts   client        │ /v1/  │   → provider → validation    │
│                            │ chat  │            ▲                 │
│ ❌ NEVER holds a secret    │       │            │ GROQ_API_KEY    │
└────────────────────────────┘       └────────────┴─────────────────┘
```

`src/` must never import from `chat-api/`. That boundary is enforced by a test in
`packages/contracts/chat.test.ts`, which scans every `src/**/*.ts(x)` file. The two share only
`@ijac/contracts`, which is deliberately free of Node-only and provider imports.

## Environment

All variables are required unless stated otherwise. Missing or malformed values fail closed:
`loadChatApiConfig` reports **every** problem at once and the API refuses to serve.

| Variable | Example | Notes |
|---|---|---|
| `GROQ_API_KEY` | `gsk_…` | Secret. Server-only. Sent as a bearer header, never in a request body. |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Must support structured output (`response_format: json_schema`). |
| `CHAT_API_ENABLED` | `true` | Deploy flag. Anything other than the exact string `true` disables the API. Optional; defaults to disabled. |
| `CHAT_API_ALLOWED_ORIGINS` | `https://ijac.com.ar,https://www.ijac.com.ar` | Comma-separated **exact** origins. Wildcards, paths, ports, credentials and `http:` are all rejected at load time. |
| `CHAT_API_CLIENT_KEY_SECRET` | 32+ random bytes | HMAC secret for per-client quota keys. Rotating it resets all client counters and makes old keys uncorrelatable. |
| `CHAT_API_CLIENT_QUOTA` | `10` | Requests per client per window. Positive integer. |
| `CHAT_API_GLOBAL_QUOTA` | `500` | Requests across all clients per window. Positive integer. |
| `CHAT_API_QUOTA_WINDOW_SECONDS` | `3600` | Fixed window length. |
| `CHAT_API_TIMEOUT_MS` | `8000` | Provider timeout. |
| `CHAT_API_MAX_BYTES` | `2048` | Max request body size, measured in **UTF-8 bytes**, not characters. |
| `CHAT_API_KV_URL` | `https://….upstash.io` | KV REST endpoint. Must be `https:`. |
| `CHAT_API_KV_TOKEN` | opaque token | Secret. Sent as a bearer header, never in a URL, and excluded from `redactConfig`. |

The website is configured separately, at build time:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_CHAT_AI_ENABLED` | Must be exactly `true`. Anything else restores deterministic-only behaviour. |
| `NEXT_PUBLIC_CHAT_API_URL` | e.g. `https://api.ijac.com.ar`. Both must be set or the client is `null`. |

## Contract

One question per request. No history, no transcript, no attachments, no streaming.

```jsonc
// POST /v1/chat
{ "apiVersion": "v1", "question": "…", "language": "es" | "en" | "pt" }
```

Any extra field is rejected before a provider call. Responses are a discriminated union on
`code`; only `SUCCESS` carries `answer` and `sources`.

| Result | HTTP | Meaning |
|---|---|---|
| `SUCCESS` | 200 | Grounded answer with 0–3 approved sources. |
| `UNKNOWN` | 200 | No approved answer. A normal, readable outcome — the visitor sees a handoff card. |
| `RATE_LIMITED` | 429 | Client or global quota exhausted, or the provider rate-limited us. |
| `DISABLED` | 503 | Deploy flag off, or the operational kill switch is set. |
| `PROVIDER_UNAVAILABLE` | 503 | Timeout, connection failure, removed model, or KV unreachable. |
| `INVALID_REQUEST` | 405 / 403 / 415 / 413 / 400 | Method, origin, content type, size, or contract violation. |

## Request precedence

Stages short-circuit in this order. Nothing downstream of a rejection is consulted.

1. `OPTIONS` → preflight, no quota consumed.
2. **Envelope** (`cors.ts`) — method → origin → content type → size → JSON → contract.
   Origin is checked *before* the body is parsed, so a disallowed origin never causes the
   server to parse attacker-controlled input.
3. **Gate** (`controls.ts`) — deploy flag → kill switch → global quota → client quota.
   A disabled deployment touches the KV store not at all.
4. **Retrieval** (`packages/knowledge`) — below the score threshold, the provider is
   **never called** and a handoff is returned. This is the control that keeps the model out of
   off-script questions.
5. **Provider** (`providers/groq.ts`) — receives only question, language and evidence.
   At most one retry, and only for an eligible 5xx.
6. **Validation** (`validation.ts`) — ungrounded output fails closed to `UNKNOWN`.

## Privacy

Nothing is logged. There are zero `console.*` calls in this package.

`buildTelemetryRecord` produces the only shape that may be persisted, and it copies fields
explicitly rather than spreading, so unexpected keys are structurally dropped:

```ts
{ outcome, sourceIds, language, latencyBand, errorCategory }
```

Prompts, answers, provider payloads, secrets and raw IP addresses are never retained. The caller
address is used solely as HMAC input in `deriveClientKey` and is never stored. Aggregates expire
after `TELEMETRY_TTL_SECONDS` (30 days).

## Local development

```bash
npm test -- chat-api      # unit tests for this package
npx tsc --noEmit          # typecheck
npm run lint              # ESLint 9 flat config
```

Tests use `chat-api/testing/fakeRedis.ts` and a fake `fetch` transport. **No test performs a
live Groq call or touches production infrastructure**, so no credentials are needed to run them.

`FakeRedis.startOutage()` forces every KV operation to reject, which is how the fail-closed paths
are exercised against a real rejection rather than a mocked return value.

## KV store

`kv/upstash.ts` implements `KvClient` over the Upstash REST protocol as a thin `fetch` wrapper —
three commands, no SDK, no added dependency. `packages/contracts/chat.test.ts` still asserts
`@upstash/redis` is absent from this manifest, and that assertion remains true and worth keeping.

Every failure throws, so `evaluateGate` catches and returns `PROVIDER_UNAVAILABLE`. An
unreachable, misconfigured or misbehaving store fails closed rather than serving unmetered
traffic. Thrown messages are fixed strings: neither the token nor the upstream body appears in
them, because an error can travel further than the request that produced it. Keys are
URL-encoded, so an HMAC suffix can never alter the request path, and every call is bounded by an
abort signal.

## Composition and deployment

`app.ts` is the composition root. `createChatApp(env, overrides?)` turns an environment record
into a `(Request) => Promise<Response>` handler, wiring config, the KV client, the Groq provider
and the knowledge retriever. Nothing below it reads `process.env`, which is why every layer stays
injectable and the whole pipeline is exercised end to end in `app.test.ts` with a single fake
transport routed by host.

Configuration problems are **returned, not thrown**, so a misconfigured deployment reports which
variables are wrong instead of crashing on the first request.

```
api/chat.ts     serverless entry; builds the app once at cold start
vercel.json     rewrites the public /v1/chat onto /api/chat
```

Deploy `chat-api/` as its own Vercel project with the root directory set to `chat-api`, so the
website and the API release independently.

**Diagnosing a dead deployment:** if every path returns an empty `503`, configuration failed to
load. The entry point deliberately returns no detail — a public endpoint must not describe its own
misconfiguration — so check the environment against the table above.
