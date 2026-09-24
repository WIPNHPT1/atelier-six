const FFT_SIZE = 4096;
const SILENT_GAIN = 0;

export class MicUnsupportedError extends Error {}
export class MicPermissionDeniedError extends Error {}

export type MicFrameListener = (buffer: Float32Array, sampleRate: number) => void;

type MicState = {
  stream: MediaStream;
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  silentGain: GainNode;
  buffer: Float32Array;
  rafId: number;
};

let state: MicState | null = null;

function isPermissionDenied(error: unknown): boolean {
  return (
    error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
  );
}

export async function startMic(onFrame: MicFrameListener): Promise<void> {
  let stream: MediaStream;
  try {
    // navigator.mediaDevices is missing entirely in older/unsupported browsers, which
    // throws a TypeError here (there is no feature-detectable optional form in the DOM types).
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new MicUnsupportedError('Microphone access is not supported in this browser.');
    }
    if (isPermissionDenied(error)) {
      throw new MicPermissionDeniedError('Microphone permission was denied.');
    }
    throw error;
  }

  const audioContext = new AudioContext();
  // Safari (iOS and macOS) leaves a freshly created AudioContext suspended once the
  // getUserMedia await breaks the user-gesture chain, so frames come back silent forever
  // unless it's explicitly resumed here.
  await audioContext.resume();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  source.connect(analyser);
  // Safari only pulls audio through nodes that reach the destination, so an analyser left
  // as a dead end gets no data at all; route it out through a muted gain instead.
  const silentGain = audioContext.createGain();
  silentGain.gain.value = SILENT_GAIN;
  analyser.connect(silentGain);
  silentGain.connect(audioContext.destination);
  const buffer = new Float32Array(analyser.fftSize);

  function loop() {
    if (state === null) return;
    analyser.getFloatTimeDomainData(buffer);
    onFrame(buffer, audioContext.sampleRate);
    state.rafId = requestAnimationFrame(loop);
  }

  state = { stream, audioContext, source, analyser, silentGain, buffer, rafId: 0 };
  state.rafId = requestAnimationFrame(loop);
}

export function stopMic(): void {
  if (state === null) return;
  cancelAnimationFrame(state.rafId);
  state.source.disconnect();
  state.silentGain.disconnect();
  state.stream.getTracks().forEach((track) => {
    track.stop();
  });
  void state.audioContext.close();
  state = null;
}
