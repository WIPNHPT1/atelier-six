import { useEffect, useState } from 'react';
import { parseCommand } from '../../core/input/parseCommand';
import { claimMic, registerMicStopper, releaseMic } from '../../audio/micArbiter';
import { dispatchSetTempo, dispatchToActivePage } from '../../ui/shortcuts/shortcutRegistry';

type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> };

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const global = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return global.SpeechRecognition ?? global.webkitSpeechRecognition ?? null;
}

export function isVoiceCommandsSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

function runCommand(transcript: string): void {
  const action = parseCommand(transcript);
  if (!action) return;
  if (action.type === 'tempo') dispatchSetTempo(action.bpm);
  else dispatchToActivePage(action.type);
}

// Opt-in only, off by default: mounted whenever the setting is on, torn down when it
// isn't. Voice and the tuner mic must not run at once, so this yields via micArbiter.
export function useVoiceCommands(enabled: boolean): { listening: boolean } {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript;
      if (transcript) runCommand(transcript);
    };
    recognition.onstart = () => {
      setListening(true);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    const unregister = registerMicStopper('voice', () => {
      recognition.stop();
    });
    claimMic('voice');
    try {
      recognition.start();
    } catch {
      // Already false by default; onstart never fires if start() throws synchronously.
    }

    return () => {
      unregister();
      releaseMic('voice');
      recognition.stop();
      setListening(false);
    };
  }, [enabled]);

  return { listening };
}
