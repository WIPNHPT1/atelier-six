import { Link } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { LearnTabs } from '../../app/layout/LearnTabs';
import { copy, t } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Pill } from '../../ui/Pill';
import { Text } from '../../ui/Text';
import { MODULES, lessonsFor, listenRefs } from '../lesson/lessonData';
import styles from './CoursePage.module.css';
import { ProgressRing } from './ProgressRing';
import { useProgressData } from '../progress/store';
import { moduleProgress } from '../progress/summary';

export default function CoursePage() {
  const data = useProgressData();
  return (
    <>
      <PageHeader title={copy.course.learnTitle}>
        <div className={styles.headerRow}>
          <Text dim className={styles.intro}>
            {copy.course.intro}
          </Text>
          <LearnTabs />
        </div>
      </PageHeader>
      <ul className={styles.cards}>
        {MODULES.map((module) => {
          const meta = copy.course.modules[module.id];
          const lessons = lessonsFor(module.id);
          const artists = [...new Set(listenRefs(module.id).map((ref) => ref.artist))];
          const { done, started } = moduleProgress(module.id, data);
          return (
            <li key={module.id}>
              <Link to={`/course/${module.id}`} className={styles.card} data-finish={module.finish}>
                <div className={styles.cardTop}>
                  <Mono className={styles.finish}>
                    {t('course.finishLabel', { finish: copy.course.finishes[module.finish] })}
                  </Mono>
                  <ProgressRing
                    done={done}
                    total={lessons.length}
                    label={t('course.progressRing', { done, total: lessons.length })}
                  />
                </div>
                <Heading level={2} className={styles.cardTitle}>
                  {meta.title}
                </Heading>
                <Text dim size="small">
                  {[meta.style, ...artists].join(' · ')}
                </Text>
                <div className={styles.pills}>
                  {module.available ? (
                    <>
                      <Pill>
                        {done > 0
                          ? t('course.statusProgress', { done, total: lessons.length })
                          : started
                            ? copy.course.statusStarted
                            : copy.course.statusNew}
                      </Pill>
                      <Pill>{t('course.lessonCount', { count: lessons.length })}</Pill>
                    </>
                  ) : (
                    <Pill>{copy.course.comingSoon}</Pill>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
