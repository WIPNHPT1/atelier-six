import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { copy } from '../../content/copy.en-GB';
import { useSettingsStore } from '../../app/settingsStore';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { demoScript, type DemoStep } from './script';
import { useDemoStore } from './demoStore';
import styles from './DemoRunner.module.css';

const FIND_TIMEOUT_MS = 2500;
const POLL_MS = 100;

function findElement(step: { selector: string; text?: string }): HTMLElement | null {
  const matches = Array.from(document.querySelectorAll<HTMLElement>(step.selector));
  return (
    matches.find((el) => step.text === undefined || el.textContent.trim() === step.text) ?? null
  );
}

async function waitForElement(step: { selector: string; text?: string }) {
  const deadline = performance.now() + FIND_TIMEOUT_MS;
  for (;;) {
    const el = findElement(step);
    if (el !== null || performance.now() > deadline) return el;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

function setSelectValue(el: HTMLElement, value: string) {
  if (!(el instanceof HTMLSelectElement)) return;
  // React tracks the value itself; go through the native setter so onChange sees the change.
  Reflect.set(HTMLSelectElement.prototype, 'value', value, el);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function markStep(value: string) {
  document.documentElement.dataset.demoStep = value;
}

// Runs `/?demo=1`: waits for one click (browsers only allow sound after a real gesture), then
// plays the scripted tour. Any key or tap after that ends it.
export default function DemoRunner() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'ready' | 'running' | 'ended'>('ready');
  const setActive = useDemoStore((s) => s.setActive);

  useEffect(() => {
    if (phase !== 'running') return;
    let cancelled = false;

    async function run(step: DemoStep) {
      if (step.kind === 'go') {
        await navigate(step.path);
      } else if (step.kind === 'finish') {
        useSettingsStore.getState().setFinish(step.finish);
      } else {
        const el = await waitForElement(step);
        if (el === null) {
          // Keep going, but leave a trace for the e2e test to catch a broken selector.
          const root = document.documentElement;
          root.dataset.demoMissed = `${root.dataset.demoMissed ?? ''}${step.selector} `;
          return;
        }
        if (step.kind === 'select') setSelectValue(el, step.value);
        else el.click();
      }
    }

    async function tour() {
      for (const [index, step] of demoScript.entries()) {
        if (cancelled) return;
        markStep(String(index));
        await run(step);
        await new Promise((resolve) => setTimeout(resolve, step.ms));
      }
      if (!cancelled) markStep('done');
    }

    function exit() {
      cancelled = true;
      setPhase('ended');
    }

    void tour();
    document.addEventListener('pointerdown', exit, { capture: true, once: true });
    document.addEventListener('keydown', exit, { capture: true, once: true });
    return () => {
      cancelled = true;
      document.removeEventListener('pointerdown', exit, { capture: true });
      document.removeEventListener('keydown', exit, { capture: true });
    };
  }, [phase, navigate]);

  useEffect(() => {
    if (phase !== 'ended') return;
    setActive(false);
    delete document.documentElement.dataset.demoStep;
    void import('../../audio/transport').then(({ stop }) => {
      stop();
    });
  }, [phase, setActive]);

  if (phase !== 'ready') return null;
  return createPortal(
    <div className={styles.overlay} data-testid="demo-start">
      <Text>{copy.demo.intro}</Text>
      <Button
        variant="primary"
        onClick={() => {
          setActive(true);
          setPhase('running');
        }}
      >
        {copy.demo.start}
      </Button>
    </div>,
    document.body,
  );
}
