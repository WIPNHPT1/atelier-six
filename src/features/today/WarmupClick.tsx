import { useMetronome } from '../../audio/useMetronome';
import { copy } from '../../content/copy.en-GB';
import { WARMUP_BPM } from '../../core/practice/warmup';
import { Button } from '../../ui/Button';

// Loaded on the first Start tap so Today doesn't pull in the audio engine up front.
export default function WarmupClick() {
  const metronome = useMetronome({ bpm: WARMUP_BPM, on: true });
  return (
    <Button
      variant="quiet"
      onClick={metronome.toggle}
      aria-label={metronome.isOn ? copy.today.stopClick : copy.today.startClick}
    >
      {metronome.isOn ? copy.today.stop : copy.today.start}
    </Button>
  );
}
