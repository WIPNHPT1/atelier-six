# Audio sample licences

Recorded here per CLAUDE.md (step 5.5): source, licence and attribution for every third-party
sample shipped under `public/audio/`. No song tabs or lyrics; instrument samples only.

## Electric guitar — `public/audio/guitar-electric/*.mp3`

- Source: [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) by
  Nicholaus P. Brosowsky, sample originator [Karoryfer Samples](https://www.karoryfer.com/karoryfer-samples).
- Licence: samples released under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)
  (repo code is MIT).
- Attribution: "Electric guitar samples by Karoryfer Samples, via tonejs-instruments
  (nbrosowsky), CC-BY 3.0."
- Notes: clean tone only — no driven/palm-muted variant is available in this pack. Driven and
  palm-muted character are produced in the engine (filter + cabinet convolver), not from
  separate samples. Ten notes kept (E2, C3, D#3, F#3, A3, C4, D#4, F#4, A4, C5, every minor
  third), `Tone.Sampler` pitch-shifts the gaps.

## Electric bass — `public/audio/bass-electric/*.mp3`

- Source: same repo/author/licence as above (Karoryfer Samples via tonejs-instruments).
- Attribution: "Electric bass samples by Karoryfer Samples, via tonejs-instruments
  (nbrosowsky), CC-BY 3.0."
- Notes: seven notes kept (E1, G1, A#1, C#2, E2, G2, A#2, every minor third).

## Drum kit — `public/audio/drums/*.wav`

- Source: [tidalcycles/sounds-tr808-fischer](https://github.com/tidalcycles/sounds-tr808-fischer)
  (Roland TR-808 recordings, Alex Fischer / TidalCycles community).
- Licence: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no
  attribution required.
- Files kept: `kick.wav` (bd8/BD0000), `snare.wav` (sd8/SD0000), `hihat-closed.wav` (ch8/CH),
  `hihat-open.wav` (oh8/OH00). One-shots only, ~22 KB each, shipped uncompressed (WAV) since
  they're already far under budget.

## Cabinet impulse response — `public/audio/cabinet-ir.wav`

- Generated procedurally by `scripts/audio/make-ir.ts` (filtered noise decay shaped like a
  1×12 speaker cabinet). No external source, no licence question.

## Budget

Guitar + bass + drums total ≈ 3.7 MB (actual byte size; `du` on this external drive over-reports
due to its large cluster size). Under the 6 MB step-5.5 budget. Samples are not part of the
entry JS bundle: they lazy-load on first Play and are cached at runtime (Settings → "Download
sounds for offline" forces the cache eagerly).
