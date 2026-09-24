import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MicPermissionDeniedError, MicUnsupportedError, startMic, stopMic } from './mic';

class FakeAnalyser {
  fftSize = 2048;
  getFloatTimeDomainData(buffer: Float32Array) {
    buffer.fill(0);
  }
}

class FakeAudioContext {
  sampleRate = 44100;
  closed = false;
  resumed = false;
  createMediaStreamSource() {
    return { connect: vi.fn(), disconnect: vi.fn() };
  }
  createAnalyser() {
    return new FakeAnalyser();
  }
  resume() {
    this.resumed = true;
    return Promise.resolve();
  }
  close() {
    this.closed = true;
    return Promise.resolve();
  }
}

function fakeStream(): { stream: MediaStream; stop: ReturnType<typeof vi.fn> } {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  return { stream, stop };
}

describe('mic', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    let calls = 0;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        calls += 1;
        if (calls <= 1) cb(0);
        return calls;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    stopMic();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('throws MicUnsupportedError when getUserMedia is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(startMic(() => undefined)).rejects.toBeInstanceOf(MicUnsupportedError);
  });

  it('throws MicPermissionDeniedError when permission is denied', async () => {
    const error = new Error('denied');
    error.name = 'NotAllowedError';
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(error) },
    });
    await expect(startMic(() => undefined)).rejects.toBeInstanceOf(MicPermissionDeniedError);
  });

  it('calls onFrame with the analyser buffer and sample rate', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(fakeStream().stream) },
    });
    const onFrame = vi.fn();
    await startMic(onFrame);
    expect(onFrame).toHaveBeenCalledWith(expect.any(Float32Array), 44100);
  });

  it('resumes the AudioContext so Safari does not leave it suspended', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(fakeStream().stream) },
    });
    const resume = vi.spyOn(FakeAudioContext.prototype, 'resume');
    await startMic(() => undefined);
    expect(resume).toHaveBeenCalled();
  });

  it('stopMic releases the stream tracks', async () => {
    const { stream, stop } = fakeStream();
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    await startMic(() => undefined);
    stopMic();
    expect(stop).toHaveBeenCalled();
  });
});
