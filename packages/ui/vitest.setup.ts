import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

// vitest.config.ts does not enable `test.globals`, so React Testing
// Library's automatic afterEach-cleanup never registers on its own — do it
// explicitly, or DOM nodes leak between tests in the same file.
afterEach(() => {
  cleanup();
});
