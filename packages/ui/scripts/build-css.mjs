import {  readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const COMPONENT_CSS_FILES = ['src/components/Button/Button.css']; // add each new component here

const base = readFileSync(resolve(root, 'src/styles.css'), 'utf8');
const componentCss = COMPONENT_CSS_FILES.map((p) => readFileSync(resolve(root, p), 'utf8')).join('\n');
writeFileSync(resolve(root, 'dist/styles.css'),
  ['/* AUTO-GENERATED — do not edit dist/styles.css directly. */', base, componentCss].join('\n'));
