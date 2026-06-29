# KoreanLearning

Mobile-first Korean Hangul learning app built with Angular.

The goal of this project is to help learners understand how to **read, recognize, pronounce, and write Hangul** step by step. The app starts with simple consonants and vowels, then progresses into syllable blocks, compound vowels, tense consonants, and final consonants/batchim patterns.

The app is designed to work well as a mobile web app and later as a Tauri-wrapped mobile application.

---

## Features

* Mobile-first Hangul practice UI
* Group-based learning progression
* Easy, medium, and hard Hangul groups
* Individual practice screens for each Hangul item
* Canvas-based handwriting pad
* Smooth handwritten strokes
* Faint preview guide for the first attempt
* Preview button to temporarily show the target again
* Clear button for repeated practice
* Pronounce button using local generated audio
* Offline-friendly runtime audio playback
* Dev-time audio generation using Edge TTS
* Generated audio source mapping for Hangul items

---

## Learning Progression

The app organizes Hangul into progressive groups instead of overwhelming the learner with every possible syllable at once.

Current group structure includes:

1. Easy Consonants
2. Easy Vowels
3. First Syllables
4. More Basic Consonants
5. More First Syllables
6. Y Vowels
7. Y Vowel Syllables
8. Aspirated Consonants
9. Aspirated Syllables
10. AE and E Vowels
11. AE and E Syllables
12. Tense Consonants
13. Tense Syllables
14. Compound Vowels
15. Compound Vowel Syllables
16. First Final Consonants
17. Batchim Patterns

This gives a practical understanding of the Hangul writing system without manually listing all possible syllables.

Hangul syllables are algorithmic. There are 19 initial consonants, 21 vowels, and 28 final consonant states, including no final consonant. That creates 11,172 possible syllable blocks, so the app teaches the system through focused groups and representative examples.

---

## Project Structure

```txt
korean-learning-app/
├── scripts/
│   └── generate-hangul-audio.ts
└── src/
    ├── assets/
    │   └── audio/
    │       └── hangul/
    └── app/
        └── hangul/
            ├── components/
            │   └── hangul-writing-pad.component.ts
            ├── data/
            │   ├── generated/
            │   │   └── hangul-audio.generated.ts
            │   ├── hangul-groups.ts
            │   └── hangul-types.ts
            ├── pages/
            │   ├── hangul-home.page.ts
            │   ├── hangul-group.page.ts
            │   └── hangul-practice.page.ts
            └── services/
                └── hangul-pronunciation.service.ts
```

---

## Hangul Data Model

Hangul content is defined in grouped curriculum data.

Each group contains:

* `id`
* `title`
* `description`
* `difficulty`
* `order`
* `items`

Each Hangul item contains:

* `id`
* `hangul`
* `romanization`
* `practicalPronunciation`
* `kind`
* `similarSound`
* `ttsText`
* `audioSrc`

Example:

```ts
{
  id: 'ga',
  hangul: '가',
  romanization: 'ga',
  practicalPronunciation: 'ga',
  kind: 'syllable',
  similarSound: 'like ga in “garden”',
  ttsText: '가',
  audioSrc: 'assets/audio/hangul/ga.mp3',
}
```

For isolated consonants and vowels, `ttsText` can be different from the displayed Hangul.

Example:

```ts
{
  id: 'giyeok',
  hangul: 'ㄱ',
  romanization: 'g/k',
  practicalPronunciation: 'g',
  kind: 'consonant',
  similarSound: 'like g in “go”',
  ttsText: '기역',
}
```

This lets the app display `ㄱ`, while generating pronunciation audio from `기역`.

---

## Audio Generation

The app does not use a runtime API for pronunciation.

Instead, audio files are generated during development and saved as static assets under:

```txt
src/assets/audio/hangul/
```

The runtime app only plays local files. This is important because the app is intended to work well on mobile and later inside a Tauri wrapper.

Audio generation uses `@andresaya/edge-tts` during development only.

Generate Hangul audio files with:

```bash
npm run hangul:audio
```

This script:

* Reads all Hangul items from the curriculum data
* Uses `ttsText` when available
* Falls back to `hangul` when `ttsText` is missing
* Generates MP3 files into `src/assets/audio/hangul`
* Writes the generated audio map to:

```txt
src/app/hangul/data/generated/hangul-audio.generated.ts
```

The generated file maps item IDs to local audio paths:

```ts
export const HANGUL_AUDIO_SRC_BY_ID: Record<string, string> = {
  ga: 'assets/audio/hangul/ga.mp3',
  giyeok: 'assets/audio/hangul/giyeok.mp3',
};
```

The curriculum data then attaches `audioSrc` automatically.

---

## Runtime Pronunciation

At runtime, pronunciation works like this:

1. Try to play the generated local audio file.
2. If local audio is missing or fails, fall back to browser speech synthesis.

The preferred path is always local audio.

This avoids requiring a backend or external API in the mobile app.

---

## Handwriting Practice

Each Hangul practice page includes a writing pad.

The writing pad supports:

* Smooth canvas drawing
* Pointer/touch input
* Faint Hangul preview
* Preview disappears after the first stroke
* Preview button temporarily shows the target again
* Clear button resets the drawing
* Pronounce button plays the target sound

The current implementation does not grade handwriting accuracy yet. This is intentional. The MVP focuses on recognition, repetition, and muscle memory before adding scoring.

Future improvements could include:

* Stroke order hints
* Handwriting comparison
* Accuracy scoring
* Spaced repetition
* Daily practice sessions
* Offline-first progress tracking

---

## Development Server

To start a local development server, run:

```bash
npm start
```

Or directly with Angular CLI:

```bash
ng serve
```

Then open:

```txt
http://localhost:4200/
```

The app automatically reloads when source files change.

---

## Building

To build the project, run:

```bash
npm run build
```

Or:

```bash
ng build
```

The build output is stored in the `dist/` directory.

---

## Running Tests

To execute unit tests, run:

```bash
npm test
```

Or:

```bash
ng test
```

---

## Code Scaffolding

Angular CLI can generate components, directives, pipes, services, and more.

Example:

```bash
ng generate component component-name
```

For a full list of available schematics:

```bash
ng generate --help
```

---

## Tauri Direction

This app is being built with a future Tauri wrapper in mind.

Runtime constraints:

* No required backend API
* No required online pronunciation service
* Mobile-friendly UI
* Local audio assets
* Browser-compatible canvas handwriting
* Possible native TTS integration later through a Tauri mobile plugin

The current pronunciation system is compatible with this direction because generated audio is bundled as app assets.

---

## Additional Resources

* [Angular CLI Documentation](https://angular.dev/tools/cli)
* [Tauri Documentation](https://tauri.app/)
* [@andresaya/edge-tts](https://github.com/andresayac/edge-tts)
