import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy, t } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Pill } from '../../ui/Pill';
import { Text } from '../../ui/Text';
import { difficultyLabel, getModule, lessonsFor, riffsFor, tuneFor } from '../lesson/lessonData';
import { RiffCard } from './RiffCard';
import styles from './CourseModulePage.module.css';
import { ProgressRing } from './ProgressRing';
import { useProgressData } from '../progress/store';
import { bestBpm, lessonDone, moduleProgress } from '../progress/summary';

const NUMBER_WIDTH = 2;

export default function CourseModulePage() {
  const { module: moduleId } = useParams<{ module: string }>();
  const data = useProgressData();
  const module = getModule(moduleId);
  if (module === undefined) {
    return (
      <PageHeader title={copy.course.notFound}>
        <Link to="/course">{copy.course.backToCourse}</Link>
      </PageHeader>
    );
  }

  const meta = copy.course.modules[module.id];
  const lessons = lessonsFor(module.id);
  const tune = tuneFor(module.id);
  const riffs = riffsFor(module.id);
  const { done } = moduleProgress(module.id, data);
  const next = lessons.find((lesson) => !lessonDone(lesson, data)) ?? lessons[0];
  const finish = copy.course.finishes[module.finish];

  return (
    <div className={styles.page} data-finish={module.finish}>
      <header className={styles.hero}>
        <div className={styles.titleBlock}>
          <Mono className={styles.crumb}>
            {t('course.moduleCrumb', { number: module.number, finish })}
          </Mono>
          <Heading level={1} className={styles.title}>
            {meta.title}
          </Heading>
          <Text dim>{meta.style}</Text>
        </div>
        {module.available ? (
          <div className={styles.progress}>
            <ProgressRing
              done={done}
              total={lessons.length}
              size={72}
              showCount
              label={t('course.progressRing', { done, total: lessons.length })}
            />
            <div className={styles.progressText}>
              <Text dim size="small">
                {t('course.complete', { done, total: lessons.length })}
              </Text>
              {next ? (
                <Link className={styles.continue} to={`/lesson/${next.id}`}>
                  {t('course.continue', { title: next.title })}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      {module.available ? (
        <div className={styles.columns}>
          <section className={styles.lessons}>
            <Mono className={styles.label}>{copy.course.lessonsHeading}</Mono>
            <ol className={styles.list}>
              {lessons.map((lesson, index) => (
                <li key={lesson.id} className={styles.row}>
                  <Mono className={styles.number}>
                    {String(index + 1).padStart(NUMBER_WIDTH, '0')}
                  </Mono>
                  <div className={styles.rowText}>
                    <Text>{lesson.title}</Text>
                    <Pill>{copy.lesson.difficultyLabels[difficultyLabel(lesson)]}</Pill>
                    {bestBpm(lesson, data) === null ? null : (
                      <Mono className={styles.best}>
                        {t(lessonDone(lesson, data) ? 'course.doneBest' : 'course.bestTempo', {
                          bpm: bestBpm(lesson, data) ?? 0,
                        })}
                      </Mono>
                    )}
                  </div>
                  <Link
                    className={styles.start}
                    to={`/lesson/${lesson.id}`}
                    aria-label={t('course.startLesson', { title: lesson.title })}
                  >
                    {copy.course.start}
                  </Link>
                </li>
              ))}
            </ol>

            {tune ? (
              <Panel className={styles.tuneCard}>
                <Mono className={styles.label}>{copy.course.theTune}</Mono>
                <Heading level={2} className={styles.title}>
                  {tune.title}
                </Heading>
                <Text dim>{copy.course.tuneHint}</Text>
                <Link className={styles.continue} to={`/lesson/${tune.id}`}>
                  {copy.course.playTune}
                </Link>
              </Panel>
            ) : null}

            {riffs.length > 0 ? (
              <>
                <Mono className={styles.label}>{copy.course.riffs}</Mono>
                <div className={styles.riffs}>
                  {riffs.map((riff) => {
                    const gate = lessons[riff.unlockAfter - 1];
                    return (
                      <RiffCard
                        key={riff.id}
                        riff={riff}
                        unlocked={gate === undefined || lessonDone(gate, data)}
                      />
                    );
                  })}
                </div>
              </>
            ) : null}
          </section>

          <aside className={styles.aside}>
            <Panel>
              <Mono className={styles.label}>{copy.course.toneRecipe}</Mono>
              <Text className={styles.tone}>{meta.tone}</Text>
              <Text dim size="small">
                {meta.toneNote}
              </Text>
            </Panel>
            <div className={styles.skills} aria-label={copy.course.skills}>
              {[meta.skill1, meta.skill2, meta.skill3, meta.skill4].map((skill) => (
                <Pill key={skill}>{skill}</Pill>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        <Text dim>{copy.course.comingSoon}</Text>
      )}
    </div>
  );
}
