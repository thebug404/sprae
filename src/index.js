import sprae from './core.js';
import './directives.js';
export default sprae;
export * from '@preact/signals-core';

// autoinit
if (document.currentScript) sprae(document.documentElement)
