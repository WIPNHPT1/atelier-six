import { useEffect, useRef } from 'react';
import { getActiveStrum } from '../../audio/playbackStore';
import { useSettingsStore } from '../../app/settingsStore';
import { computeStringPaths } from './computeStringPaths';
import { registerFrameCallback } from './loop';
import styles from './LivingStrings.module.css';

const STRING_COUNT = 6;

export type LivingStringsProps = {
  /** Must match the Fretboard(orientation="neck") it overlays. */
  size: number;
};

/** Canvas 2D overlay for a neck-orientation Fretboard: played strings vibrate and decay.
 * Caller only mounts this when motion is on (see useStrumHighlight for the motion-off
 * fallback). */
export function LivingStrings({ size }: LivingStringsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Re-read the theme colour on mode/finish changes only — not every animation frame.
  const mode = useSettingsStore((s) => s.mode);
  const finish = useSettingsStore((s) => s.finish);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const stroke = getComputedStyle(document.documentElement).getPropertyValue('--brass-hi').trim();
    const pad = size * 0.16;
    const gridSpan = size - pad * 2;
    const amplitude = (gridSpan / (STRING_COUNT - 1) / 2.6) * 0.9;

    const unregister = registerFrameCallback(() => {
      ctx.clearRect(0, 0, size, size);
      const strum = getActiveStrum();
      if (!strum) return;
      const paths = computeStringPaths(strum, gridSpan, pad, amplitude);
      ctx.strokeStyle = stroke || '#d9b77e';
      ctx.lineWidth = 1.5;
      for (const path of paths) {
        const y0 = pad + ((STRING_COUNT - 1 - path.stringIndex) * gridSpan) / (STRING_COUNT - 1);
        ctx.beginPath();
        path.points.forEach((point, i) => {
          const y = y0 + point.y;
          if (i === 0) ctx.moveTo(point.x, y);
          else ctx.lineTo(point.x, y);
        });
        ctx.stroke();
      }
    });

    return unregister;
  }, [size, mode, finish]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
