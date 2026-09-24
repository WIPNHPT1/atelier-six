import { lazy, Suspense, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { useSettingsStore } from '../../app/settingsStore';
import { copy, t } from '../../content/copy.en-GB';
import { planSession } from '../../core/practice/planner';
import { warmupAscii } from '../../core/practice/warmup';
import { chordOfShape, localDay, minutesOn, splitKey } from '../../core/progress/record';
import { Button } from '../../ui/Button';
import { Dial } from '../../ui/Dial';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { ScrollTab } from '../../ui/ScrollTab';
import { Text } from '../../ui/Text';
import { LESSONS, RIFFS, TUNES, getLesson, lessonsFor } from '../lesson/lessonData';

const PLANNER_RIFFS = RIFFS.map((riff) => ({
  id: riff.id,
  unlockedBy: lessonsFor(riff.module)[riff.unlockAfter - 1]?.id ?? null,
}));
import { useProgressData } from '../progress/store';
import styles from './TodayPage.module.css';
import { HandWarmupOffer } from '../foundations/HandWarmupOffer';

const WarmupClick = lazy(() => import('./WarmupClick'));
const DAILY_GOAL_MINUTES = 20;

function Plan() {
  const data = useProgressData();
  const [today] = useState(() => localDay(Date.now()));
  const [clickStarted, setClickStarted] = useState(false);
  const plan = planSession(today, data, LESSONS, { tunes: TUNES, riffs: PLANNER_RIFFS });
  const tune = plan.play.kind === 'tune' ? getLesson(plan.play.id ?? undefined) : undefined;
  const riff = RIFFS.find((candidate) => candidate.id === plan.play.id);
  const lesson = getLesson(plan.newLesson ?? undefined);
  const minutes = Math.round(minutesOn(data, today));

  return (
    <div className={styles.page}>
      <Panel className={styles.ring}>
        <Dial
          label={t('today.ring', { minutes, goal: DAILY_GOAL_MINUTES })}
          value={minutes / DAILY_GOAL_MINUTES}
          displayValue={t('today.ringValue', { minutes, goal: DAILY_GOAL_MINUTES })}
          size={140}
        />
      </Panel>

      <Panel className={styles.card}>
        <div className={styles.cardHead}>
          <Mono className={styles.label}>{copy.today.warmup}</Mono>
          <Mono className={styles.label}>
            {t('today.minutes', { minutes: plan.minutes.warmup })}
          </Mono>
        </div>
        <Text>
          {t('today.warmupDetail', {
            pattern: plan.warmup.pattern.join('-'),
            fret: plan.warmup.position,
            bpm: plan.warmup.bpm,
          })}
        </Text>
        <ScrollTab className={styles.tab} label={copy.today.warmupTab}>
          {warmupAscii(plan.warmup)}
        </ScrollTab>
        {clickStarted ? (
          <Suspense fallback={null}>
            <WarmupClick />
          </Suspense>
        ) : (
          <Button
            variant="primary"
            aria-label={copy.today.startClick}
            onClick={() => {
              setClickStarted(true);
            }}
          >
            {copy.today.start}
          </Button>
        )}
      </Panel>

      <Panel className={styles.card}>
        <div className={styles.cardHead}>
          <Mono className={styles.label}>{copy.today.newLesson}</Mono>
          <Mono className={styles.label}>
            {t('today.minutes', { minutes: plan.minutes.lesson })}
          </Mono>
        </div>
        {lesson ? (
          <>
            <Heading level={2} className={styles.title}>
              {lesson.title}
            </Heading>
            <Text dim>{lesson.goal}</Text>
            <Link className={styles.start} to={`/lesson/${lesson.id}`}>
              {copy.today.start}
            </Link>
          </>
        ) : (
          <>
            <Text dim>{copy.today.allDone}</Text>
            <Link className={styles.start} to="/course">
              {copy.today.browse}
            </Link>
          </>
        )}
      </Panel>

      <Panel className={styles.card}>
        <div className={styles.cardHead}>
          <Mono className={styles.label}>{copy.today.tune}</Mono>
          <Mono className={styles.label}>{t('today.minutes', { minutes: plan.minutes.play })}</Mono>
        </div>
        {tune ? (
          <Text>{t('today.tuneReady', { title: tune.title })}</Text>
        ) : riff ? (
          <Text>{t('today.playRiff', { title: riff.title })}</Text>
        ) : (
          <Text>{copy.today.playJam}</Text>
        )}
        <Link
          className={styles.start}
          to={tune ? `/lesson/${tune.id}` : riff ? `/course/${riff.module}` : '/drills'}
          aria-label={copy.today.startPlay}
        >
          {copy.today.start}
        </Link>
      </Panel>

      <Panel className={styles.card}>
        <Mono className={styles.label}>{copy.today.reviews}</Mono>
        <Text dim size="small">
          {copy.today.reviewsHint}
        </Text>
        {plan.reviews.length === 0 ? (
          <Text>{copy.today.reviewsEmpty}</Text>
        ) : (
          <ul className={styles.list}>
            {plan.reviews.map((key) => {
              const { from, to } = splitKey(key);
              const names = { from: chordOfShape(from), to: chordOfShape(to) };
              return (
                <li key={key} className={styles.row}>
                  <Text>{t('today.reviewEntry', names)}</Text>
                  <Link
                    className={styles.drill}
                    to={`/drills?kind=loop&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}
                    aria-label={t('today.drillLabel', names)}
                  >
                    {copy.today.drill}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function TodayPage() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      <PageHeader title={copy.today.title}>
        <Text dim>{copy.today.intro}</Text>
      </PageHeader>
      <HandWarmupOffer />
      <Plan />
    </>
  );
}
