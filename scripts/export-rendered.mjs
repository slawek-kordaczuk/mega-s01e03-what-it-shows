import fs from 'node:fs';

// Preserve the actual prerendered output and its assets, not a hand-written HTML substitute.
fs.cpSync(new URL('../build/', import.meta.url), new URL('../rendered/', import.meta.url), { recursive: true });
console.log('Copied the prerendered KB and runtime assets into rendered/.');
