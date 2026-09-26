import { useEffect, useMemo, useState } from 'react';
import { candidatesFor, optimise } from '../../core/engine/optimise';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { useMotionEnabled } from '../../app/settingsStore';

const STEP_MS = 1600;

// G → C → G… on one fretboard, with the other shape ghosted so the moving fingers stand out.
// With motion off it holds still on the first shape.
export function LoopDemo() {
  const motionEnabled = useMotionEnabled();
  const shapes = useMemo(() => optimise(candidatesFor(['G', 'C']), { loop: true }).shapes, []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!motionEnabled) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % 2);
    }, STEP_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [motionEnabled]);

  const current = shapes[motionEnabled ? index : 0];
  const other = shapes[motionEnabled ? (index + 1) % 2 : 1];
  if (current === undefined || other === undefined) return null;
  return <Fretboard shape={current} ghost={other} showFingers />;
}
