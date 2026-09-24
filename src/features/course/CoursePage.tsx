import { Link } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { LearnTabs } from '../../app/layout/LearnTabs';
import { copy, t } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Mono } from '../../ui/Mono';
import { Pill } from '../../ui/Pill';
import { Text } from '../../ui/Text';
import { MODULES, lessonsFor } from '../lesson/lessonData';
import styles from './CoursePage.module.css';
import { ProgressRing } from './ProgressRing';
import { FOUNDATIONS } from '../foundations/data';
import { useSettingsStore } from '../../app/settingsStore';
import { useProgressData } from '../progress/store';
import { moduleProgress } from '../progress/summary';

export default function CoursePage() {
  const data = useProgressData();
  const level = useSettingsStore((s) => s.level);
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
        <li>
          <Link to="/foundations" className={styles.card} data-testid="foundations-card">
            <div className={styles.cardTop}>
              <Mono className={styles.finish}>{copy.foundations.style}</Mono>
            </div>
            <Heading level={2} className={styles.cardTitle}>
              {copy.foundations.title}
            </Heading>
            <Text dim size="small">
              {copy.foundations.intro}
            </Text>
            <div className={styles.pills}>
              <Pill>{t('foundations.lessonCount', { count: FOUNDATIONS.length })}</Pill>
              {level === 'confident' ? <Pill>{copy.foundations.optional}</Pill> : null}
            </div>
          </Link>
        </li>
        {MODULES.map((module) => {
          const meta = copy.course.modules[module.id];
          const lessons = lessonsFor(module.id);
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
                  {meta.style}
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
