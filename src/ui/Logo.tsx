import styles from './Logo.module.css'
import { copy } from '../content/copy.en-GB'

export type LogoVariant = 'mark' | 'lockup' | 'small'

export type LogoProps = {
  variant?: LogoVariant
  size?: number
  title?: string
}

function MarkGlyph({ title }: { title: string }) {
  return (
    <>
      <title>{title}</title>
      <path
        data-testid="logo-letter-v"
        d="M19 29H41V31.2Q37.6 31.5 37.3 33.6L52.8 75L65.6 34Q66 31.5 61.5 31.2V29H75V31.2Q70.2 31.5 68.6 34L51.6 87H49.2L29.6 34Q28.4 31.5 19 31.2Z"
        fill="var(--bone)"
      />
      <path
        data-testid="logo-letter-i"
        d="M81 29H100V31.2Q96 31.6 95 34V81Q96 83.4 100 83.8V86H81V83.8Q85 83.4 86 81V34Q85 31.6 81 31.2Z"
        fill="var(--bone)"
      />
      <line
        data-testid="logo-line-hairline"
        x1="22"
        y1="22"
        x2="98"
        y2="22"
        stroke="var(--bone)"
        strokeOpacity=".35"
        strokeWidth=".8"
      />
      <line
        data-testid="logo-line-brass"
        x1="22"
        y1="97"
        x2="98"
        y2="97"
        stroke="var(--brass)"
        strokeWidth="1.4"
      />
      <circle data-testid="logo-dot" cx="60" cy="97" r="4.2" fill="var(--brass)" />
    </>
  )
}

function SmallGlyph({ title }: { title: string }) {
  return (
    <>
      <title>{title}</title>
      <rect width="120" height="120" rx="24" fill="var(--ebony)" />
      <g transform="translate(60 60) scale(.92) translate(-60 -62)">
        <path
          data-testid="logo-letter-v"
          d="M19 29H41V31.2Q37.6 31.5 37.3 33.6L52.8 75L65.6 34Q66 31.5 61.5 31.2V29H75V31.2Q70.2 31.5 68.6 34L51.6 87H49.2L29.6 34Q28.4 31.5 19 31.2Z"
          fill="var(--bone)"
        />
        <path
          data-testid="logo-letter-i"
          d="M81 29H100V31.2Q96 31.6 95 34V81Q96 83.4 100 83.8V86H81V83.8Q85 83.4 86 81V34Q85 31.6 81 31.2Z"
          fill="var(--bone)"
        />
        <line
          data-testid="logo-line-brass"
          x1="22"
          y1="97"
          x2="98"
          y2="97"
          stroke="var(--brass)"
          strokeWidth="5"
        />
      </g>
    </>
  )
}

export function Logo({ variant = 'mark', size = 32, title = copy.brand.name }: LogoProps) {
  const useSmall = variant === 'small' || size < 32

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      data-testid={useSmall ? 'logo-small' : 'logo-mark'}
    >
      {useSmall ? <SmallGlyph title={title} /> : <MarkGlyph title={title} />}
    </svg>
  )

  if (variant === 'lockup' && !useSmall) {
    return (
      <span className={styles.lockup}>
        {svg}
        <span className={styles.wordmark} data-testid="logo-wordmark">
          {copy.brand.name}
        </span>
      </span>
    )
  }

  return svg
}
