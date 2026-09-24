import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy, t } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Text } from '../../ui/Text';
import { FOUNDATIONS, isFoundation, type FoundationId } from './data';
import { Fretting } from './Fretting';
import styles from './Foundations.module.css';
import { HandHealth } from './HandHealth';
import { HoldGuitar } from './HoldGuitar';
import { ReadTab } from './ReadTab';
import { TuneUp } from './TuneUp';

const BODIES: Record<FoundationId, () => React.JSX.Element> = {
  'read-tab': ReadTab,
  hold: HoldGuitar,
  'tune-up': TuneUp,
  fretting: Fretting,
  'hand-health': HandHealth,
};

function Index() {
  return (
    <>
      <PageHeader title={copy.foundations.title} breadcrumb={copy.course.learnTitle}>
        <Text dim>{copy.foundations.intro}</Text>
      </PageHeader>
      <ol className={styles.index}>
        {FOUNDATIONS.map((lesson, i) => (
          <li key={lesson.id} className={styles.listRow}>
            <Mono className={styles.label}>{String(i + 1).padStart(2, '0')}</Mono>
            <div className={styles.grow}>
              <Text>{copy.foundations.lessons[lesson.id].title}</Text>
              <Text dim size="small">
                {t('foundations.minutes', { minutes: lesson.minutes })}
              </Text>
            </div>
            <Link
              className={styles.link}
              to={`/foundations/${lesson.id}`}
              aria-label={t('course.startLesson', {
                title: copy.foundations.lessons[lesson.id].title,
              })}
            >
              {copy.foundations.start}
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function FoundationsPage() {
  const { id } = useParams<{ id: string }>();
  if (!isFoundation(id)) return <Index />;
  const index = FOUNDATIONS.findIndex((lesson) => lesson.id === id);
  const next = FOUNDATIONS[index + 1];
  const Body = BODIES[id];
  const text = copy.foundations.lessons[id];

  return (
    <div className={styles.page}>
      <header className={styles.stack}>
        <Mono className={styles.crumb}>
          {t('foundations.crumb', { number: index + 1, total: FOUNDATIONS.length })}
        </Mono>
        <Heading level={1} className={styles.title}>
          {text.title}
        </Heading>
        <Text dim>{text.goal}</Text>
      </header>
      <Body />
      <nav className={styles.row} aria-label={copy.foundations.title}>
        <Link className={styles.link} to="/foundations">
          {copy.foundations.back}
        </Link>
        {next ? (
          <Link className={styles.primaryLink} to={`/foundations/${next.id}`}>
            {copy.foundations.next}
          </Link>
        ) : (
          <Link className={styles.primaryLink} to="/course">
            {copy.foundations.done}
          </Link>
        )}
      </nav>
    </div>
  );
}
