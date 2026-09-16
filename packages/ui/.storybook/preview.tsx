import type { Preview } from '@storybook/react';

// Tokens first, then every component stylesheet.
//
// This glob is the fix for the original "Storybook looks nothing like the
// design" bug. `styles.css` only holds tokens, so importing just that file
// left `.sk-button { position: relative }` undefined — which let the
// absolutely-positioned SVG frame escape to the top-left corner of the
// viewport while the button itself fell back to browser default chrome.
// Globbing means adding a component never requires touching this file again.
import '../src/styles.css';
const componentStyles = import.meta.glob('../src/**/*.css', { eager: true });
void componentStyles;

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#faf9f6' },
        { name: 'white', value: '#ffffff' },
        { name: 'slate', value: '#22201d' },
      ],
    },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
};

export default preview;
