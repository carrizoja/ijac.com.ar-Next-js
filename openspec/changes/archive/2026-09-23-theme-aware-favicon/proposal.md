## Why

The site currently exposes one favicon regardless of the browser or operating-system color scheme, which can reduce logo contrast in dark browser chrome. The site should present the negative logo in dark mode while preserving the existing favicon in light mode and in clients that do not support media-specific favicon selection.

## What Changes

- Publish light- and dark-scheme favicon variants through standards-based icon metadata using `prefers-color-scheme` media queries.
- Keep the current favicon as the unconditional fallback so unsupported clients retain today's behavior.
- Apply the favicon behavior consistently to the Spanish and English document roots at `ijac.com.ar`.
- Add the negative-logo favicon asset needed by the dark-scheme declaration without changing installed-app icons or Apple touch icons.
- Add verification for generated metadata and static-export output, including fallback ordering.

## Capabilities

### New Capabilities
- `theme-aware-favicon`: Selects a browser favicon according to the user's preferred color scheme while preserving the current icon as a compatibility fallback.

### Modified Capabilities

None.

## Impact

- Affected areas: shared Next.js metadata, favicon assets under the statically exported site, and metadata-focused tests or export checks.
- Both `/` and `/en` routes must emit equivalent favicon declarations.
- No API, runtime dependency, routing, manifest installed-app icon, or application theme-toggle behavior changes are required.
