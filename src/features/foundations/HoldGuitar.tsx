import { copy } from '../../content/copy.en-GB';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import styles from './Foundations.module.css';

// Simple line drawings; strokes use currentColor so they follow the theme.
export function HoldGuitar() {
  const h = copy.foundations.hold;
  return (
    <div className={styles.cards}>
      <Panel className={styles.stack}>
        <svg
          className={styles.drawing}
          viewBox="0 0 160 120"
          role="img"
          aria-label={h.sittingLabel}
        >
          <circle cx="60" cy="18" r="10" />
          <path d="M60 28 L60 70 L95 72 L100 110 M60 70 L40 110 M60 40 L90 55" />
          <path d="M70 60 C80 45 115 45 120 60 C125 75 90 85 75 75 Z M118 55 L150 30" />
        </svg>
        <Text>{h.sitting}</Text>
        <Text dim>{h.standing}</Text>
      </Panel>
      <Panel className={styles.stack}>
        <svg className={styles.drawing} viewBox="0 0 160 120" role="img" aria-label={h.pickLabel}>
          <path d="M40 80 C40 50 70 40 95 50 L120 60 M60 75 C80 70 100 72 118 80" />
          <path d="M95 55 L112 58 L104 74 Z" />
        </svg>
        <Text>{h.pick}</Text>
      </Panel>
      <Panel className={styles.stack}>
        <svg className={styles.drawing} viewBox="0 0 160 120" role="img" aria-label={h.palmLabel}>
          <path d="M10 60 L150 60 M10 66 L150 66 M10 72 L150 72 M10 78 L150 78" />
          <rect x="112" y="52" width="10" height="34" />
          <path d="M100 40 C120 38 135 50 128 62 L108 62 C100 55 95 48 100 40 Z" />
        </svg>
        <Text>{h.palm}</Text>
      </Panel>
    </div>
  );
}
