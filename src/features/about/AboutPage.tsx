import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import { Heading } from '../../ui/Heading';
import { Logo } from '../../ui/Logo';
import { Panel } from '../../ui/Panel';
import { Pill } from '../../ui/Pill';
import { Text } from '../../ui/Text';
import { LatticeDemo } from './LatticeDemo';
import { LoopDemo } from './LoopDemo';
import styles from './AboutPage.module.css';

const REPO = 'https://github.com/WIPNHPT1/atelier-six';
const FINISHES = [
  copy.settings.finishNitro,
  copy.settings.finishXerox,
  copy.settings.finishSunburst,
  copy.settings.finishFaded,
  copy.settings.finishStencil,
];
const QUALITY = [
  copy.about.qualityCoverage,
  copy.about.qualityE2e,
  copy.about.qualityLighthouse,
  copy.about.qualityEntry,
  copy.about.qualityFrame,
];
const LINKS = [
  { href: REPO, label: copy.about.linkRepo },
  { href: `${REPO}/blob/main/docs/engine.md`, label: copy.about.linkEngine },
  { href: `${REPO}/tree/main/docs/adr`, label: copy.about.linkAdrs },
];

export default function AboutPage() {
  return (
    <PageHeader title={copy.about.pageTitle} shortTitle={copy.about.title}>
      <article className={styles.page}>
        <header className={styles.hero}>
          <Logo variant="lockup" size={48} />
          <p className={styles.lede}>{copy.about.lede}</p>
        </header>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.problemHeading}</Heading>
          <Text>{copy.about.problem}</Text>
          <figure className={styles.figure}>
            <LoopDemo />
            <figcaption>
              <Text dim size="small">
                {copy.about.demoCaption}
              </Text>
            </figcaption>
          </figure>
        </section>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.engineHeading}</Heading>
          <Text>{copy.about.engine}</Text>
          <Panel>
            <LatticeDemo />
          </Panel>
          <a className={styles.link} href={`${REPO}/blob/main/docs/engine.md`}>
            {copy.about.engineLink}
          </a>
        </section>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.designHeading}</Heading>
          <Text>{copy.about.design}</Text>
          <ul className={styles.pills} aria-label={copy.about.finishesLabel}>
            {FINISHES.map((finish) => (
              <li key={finish}>
                <Pill>{finish}</Pill>
              </li>
            ))}
          </ul>
          <div className={styles.screens}>
            <img
              src="/screenshots/mobile.png"
              alt={copy.about.screenMobile}
              width={1082}
              height={1930}
              loading="lazy"
              className={styles.screenMobile}
            />
            <img
              src="/screenshots/desktop.png"
              alt={copy.about.screenDesktop}
              loading="lazy"
              className={styles.screenDesktop}
            />
          </div>
        </section>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.qualityHeading}</Heading>
          <ul className={styles.list}>
            {QUALITY.map((line) => (
              <li key={line}>
                <Text>{line}</Text>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.privacyHeading}</Heading>
          <Text>{copy.about.privacy}</Text>
        </section>

        <section className={styles.section}>
          <Heading level={2}>{copy.about.linksHeading}</Heading>
          <ul className={styles.list}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Text dim size="small">
            {copy.about.notAffiliated}
          </Text>
        </section>
      </article>
    </PageHeader>
  );
}
