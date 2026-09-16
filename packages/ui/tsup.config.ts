import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  // No `injectStyle`, no CSS entry: stylesheets are assembled by
  // scripts/build-css.mjs so that dist/styles.css — the file package.json
  // exports — is the one and only stylesheet consumers need.
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
