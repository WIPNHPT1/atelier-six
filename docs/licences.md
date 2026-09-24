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
  palm-muted character are produced in the engine (pre-drive mute filter + `Tone.Distortion` +
  cabinet convolver, short note release on palm-muted hits), not from separate samples. Ten notes kept (E2, C3, D#3, F#3, A3, C4, D#4, F#4, A4, C5, every minor
  third), `Tone.Sampler` pitch-shifts the gaps.

## Electric bass — `public/audio/bass-electric/*.mp3`

- Source: same repo/author/licence as above (Karoryfer Samples via tonejs-instruments).
- Attribution: "Electric bass samples by Karoryfer Samples, via tonejs-instruments
  (nbrosowsky), CC-BY 3.0."
- Notes: seven notes kept (E1, G1, A#1, C#2, E2, G2, A#2, every minor third).

## Drum kit — `public/audio/drums/*.wav`

- Source: [DRSKit 2.1](https://drumgizmo.org/wiki/doku.php?id=kits:drskit) by the DrumGizmo
  team (Deva & Lars Muldjord), acoustic kit lent by Jes Eiler of DRSDrums.
- Licence: [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Attribution: "Drum samples from DRSKit by the DrumGizmo team (drumgizmo.org), CC-BY 4.0."
- Files kept: `kick.wav` (Kdrum_with_contact), `snare.wav` (Snare), `hihat-closed.wav`
  (Hihat_closed), `hihat-open.wav` (Hihat_open), `crash.wav` (Crash_right_shank). One loud
  hit each, chosen and processed by `scripts/audio/fetch-drums.py`: the 13 mic channels are
  mixed down to mono, trimmed, faded and normalised to 16-bit 44.1 kHz WAV (~430 KB total).
  The script reads only these files from the 2.8 GB kit zip via HTTP range requests.
- Replaced the TR-808 kit used at first, which sounded electronic rather than like a rock band.

## Cabinet impulse response — `public/audio/cabinet-ir.wav`

- Generated procedurally by `scripts/audio/make-ir.ts` (filtered noise decay shaped like a
  1×12 speaker cabinet). No external source, no licence question.

## Budget

Guitar + bass + drums total ≈ 4.0 MB (actual byte size; `du` on this external drive over-reports
due to its large cluster size). Under the 6 MB step-5.5 budget. Samples are not part of the
entry JS bundle: they lazy-load on first Play and are cached at runtime (Settings → "Download
sounds for offline" forces the cache eagerly).
