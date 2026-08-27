import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next ships native flat configs, so they are spread directly.
// Wrapping them in FlatCompat treats a flat array as a legacy eslintrc object and crashes the validator.
const eslintConfig = [
  // Build output and vendored skill templates are not project source.
  { ignores: ["out/**", ".next/**", "next-env.d.ts", ".agents/**", ".claude/**"] },
  ...coreWebVitals,
  ...typescript,
  // scripts/ holds one-shot CommonJS Node tooling that is not part of the build,
  // so the TypeScript-oriented require ban does not apply there.
  {
    files: ["scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];

export default eslintConfig;
