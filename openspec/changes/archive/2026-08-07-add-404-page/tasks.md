## 1. Not-Found Experience

- [x] 1.1 Replace `src/app/not-found.tsx` with the semantic Spanish 404 content, page-specific metadata, and an explicit home recovery link.
- [x] 1.2 Apply the responsive dark technical composition using the existing typography and color system, with decorative elements hidden from assistive technology.
- [x] 1.3 Add visible keyboard focus states and reduced-motion-safe presentation without introducing client-side state or dependencies.

## 2. Verification

- [x] 2.1 Run the project build and resolve any TypeScript, rendering, or metadata errors introduced by the page.
- [x] 2.2 Verify an unmatched URL and an unknown `/services/[slug]` value both render the custom experience with a 404 response and a working home link.
- [x] 2.3 Check narrow and wide viewport layouts for overflow, content hierarchy, keyboard navigation, and reduced-motion behavior.
