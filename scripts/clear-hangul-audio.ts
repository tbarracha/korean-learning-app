// file: scripts/clear-hangul-audio.ts

import { rm } from 'node:fs/promises';

await rm('src/assets/audio/hangul', {
  recursive: true,
  force: true,
});