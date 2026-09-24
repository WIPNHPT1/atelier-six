import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy, t } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Pill } from '../../ui/Pill';
import { Text } from '../../ui/Text';
import { difficultyLabel, getModule, lessonsFor, listenRefs } from '../lesson/lessonData';
import styles from './CourseModulePage.module.css';
import { ProgressRing } from './ProgressRing';

const NUMBER_WIDTH = 2;

export default function CourseModulePage() {
  const { module: moduleId } = useParams<{ module: string }>();
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
  const refs = listenRefs(module.id);
  const artists = [...new Set(refs.map((ref) => ref.artist))].join(' · ');
  const done = 0;
  const next = lessons[done];
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
          <Text dim>
            {artists === ''
              ? meta.style
              : t('course.moduleSubtitle', { style: meta.style, artists })}
          </Text>
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
          </section>

          <aside className={styles.aside}>
            <Panel>
              <Mono className={styles.label}>{copy.course.toneRecipe}</Mono>
              <Text className={styles.tone}>{meta.tone}</Text>
              <Text dim size="small">
                {meta.toneNote}
              </Text>
            </Panel>
            <Panel>
              <Mono className={styles.label}>{copy.course.listenFor}</Mono>
              <ol className={styles.refs}>
                {refs.map((ref) => (
                  <li key={`${ref.artist}-${ref.song}`}>
                    <Text>{t('lesson.listenRef', { artist: ref.artist, song: ref.song })}</Text>
                  </li>
                ))}
              </ol>
              <Text dim size="small">
                {copy.course.listenNote}
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
