import { useEffect, useState } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { Fretboard } from '../../ui/Fretboard/Fretboard';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { STRING_NAMES, noteShape, playNote } from './data';
import styles from './Foundations.module.css';

// One bar of eighth notes in first position (C major), with its count underneath.
const LINE = [
  { string: 5, fret: 3 },
  { string: 4, fret: 0 },
  { string: 4, fret: 2 },
  { string: 4, fret: 3 },
  { string: 3, fret: 0 },
  { string: 3, fret: 2 },
  { string: 2, fret: 0 },
  { string: 2, fret: 1 },
];
const COUNTS = ['1', '&', '2', '&', '3', '&', '4', '&'];
const SYMBOLS = ['lines', 'numbers', 'counts', 'muted', 'palmMute', 'picking'] as const;
const QUESTIONS = [2, 5, 8];
const CHECK_SECONDS = 30;
const OPTIONS_SPREAD = [-1, 0, 1];

function optionsFor(fret: number): number[] {
  return OPTIONS_SPREAD.map((d) => fret + d + (fret === 0 ? 1 : 0));
}

export function ReadTab() {
  const [symbol, setSymbol] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CHECK_SECONDS);
  const [answers, setAnswers] = useState<number[]>([]);
  const note = selected === null ? undefined : LINE[selected];
  const correct = answers.filter(
    (fret, i) => LINE[(QUESTIONS[i] as number) - 1]?.fret === fret,
  ).length;
  const question = QUESTIONS[answers.length];
  const over = secondsLeft === 0 || question === undefined;

  useEffect(() => {
    if (!checking || over) return;
    const timer = window.setTimeout(() => {
      setSecondsLeft((left) => left - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [checking, over, secondsLeft]);

  return (
    <div className={styles.stack}>
      <Panel className={styles.stack}>
        <Mono className={styles.label}>
          {t('foundations.tab.symbol', { current: symbol + 1, total: SYMBOLS.length })}
        </Mono>
        <Text>{copy.foundations.tab[SYMBOLS[symbol] as (typeof SYMBOLS)[number]]}</Text>
        {symbol < SYMBOLS.length - 1 ? (
          <Button
            variant="quiet"
            onClick={() => {
              setSymbol((current) => current + 1);
            }}
          >
            {copy.foundations.tab.nextSymbol}
          </Button>
        ) : null}
      </Panel>

      <Panel className={styles.stack}>
        <Mono className={styles.label}>{copy.foundations.tab.exercise}</Mono>
        <div className={styles.tabGrid} role="group" aria-label={copy.foundations.tab.exercise}>
          {STRING_NAMES.map((name, row) => (
            <div key={name + String(row)} className={styles.tabRow}>
              <Mono className={styles.stringName}>{name}</Mono>
              {LINE.map((cell, i) =>
                cell.string === row + 1 ? (
                  <button
                    key={i}
                    type="button"
                    className={cx(styles.tabNote, selected === i && styles.tabNoteOn)}
                    aria-label={t('foundations.tab.noteLabel', {
                      n: i + 1,
                      string: STRING_NAMES[row] ?? '',
                      fret: cell.fret,
                    })}
                    aria-pressed={selected === i}
                    onClick={() => {
                      setSelected(i);
                      playNote(cell.string, cell.fret);
                    }}
                  >
                    {cell.fret}
                  </button>
                ) : (
                  <span key={i} className={styles.tabGap} aria-hidden="true" />
                ),
              )}
            </div>
          ))}
          <div className={styles.tabRow} aria-hidden="true">
            <span className={styles.stringName} />
            {COUNTS.map((count, i) => (
              <Mono key={i} className={styles.count}>
                {count}
              </Mono>
            ))}
          </div>
        </div>
        {note ? (
          <div className={styles.lit} data-testid="lit-note">
            <Fretboard
              shape={noteShape(note.string, note.fret)}
              size={160}
              highlightStrings={[note.string]}
            />
            <Text>
              {t('foundations.tab.nowPlaying', {
                string: STRING_NAMES[note.string - 1] ?? '',
                fret: note.fret,
              })}
            </Text>
          </div>
        ) : null}
      </Panel>

      <Panel className={styles.stack}>
        <Mono className={styles.label}>{copy.foundations.tab.check}</Mono>
        {!checking ? (
          <>
            <Text dim>{copy.foundations.tab.checkIntro}</Text>
            <Button
              variant="primary"
              onClick={() => {
                setChecking(true);
              }}
            >
              {copy.foundations.tab.checkStart}
            </Button>
          </>
        ) : over ? (
          <Text role="status">
            {secondsLeft === 0
              ? t('foundations.tab.timeUp', { correct, total: QUESTIONS.length })
              : t('foundations.tab.score', { correct, total: QUESTIONS.length })}
          </Text>
        ) : (
          <>
            <Mono>{t('foundations.tab.secondsLeft', { seconds: secondsLeft })}</Mono>
            <Text>{t('foundations.tab.question', { n: question })}</Text>
            <div className={styles.row}>
              {optionsFor(LINE[question - 1]?.fret ?? 0).map((fret) => (
                <Button
                  key={fret}
                  variant="quiet"
                  onClick={() => {
                    setAnswers((current) => [...current, fret]);
                  }}
                >
                  {t('foundations.tab.fretOption', { fret })}
                </Button>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
