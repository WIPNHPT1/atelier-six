import { create } from 'zustand';

type TiltState = {
  angleDeg: number;
  supported: boolean;
};

export const useTiltStore = create<TiltState>(() => ({
  angleDeg: 115,
  supported: false,
}));

let listening = false;

function handleOrientation(event: DeviceOrientationEvent): void {
  if (event.gamma === null) return;
  useTiltStore.setState({ angleDeg: 115 + event.gamma, supported: true });
}

function startTiltListener(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('deviceorientation', handleOrientation);
}

type RequestPermissionOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

/** Call from inside a tap handler — iOS requires the permission prompt to follow a user gesture. */
export async function requestTiltPermission(): Promise<void> {
  if (typeof DeviceOrientationEvent === 'undefined') return;
  const ctor = DeviceOrientationEvent as RequestPermissionOrientation;
  if (typeof ctor.requestPermission !== 'function') {
    // Android and desktop expose the event without a permission gate.
    startTiltListener();
    return;
  }
  try {
    const result = await ctor.requestPermission();
    if (result === 'granted') startTiltListener();
  } catch {
    // Unsupported or blocked — the sheen falls back to its time-based sweep.
  }
}
