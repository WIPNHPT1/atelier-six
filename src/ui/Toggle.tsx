import styles from './Toggle.module.css'

export type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
  const classes = [styles.toggle, checked ? styles.on : ''].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={classes}
      onClick={() => {
        onChange(!checked)
      }}
    >
      <span className={styles.knob} />
    </button>
  )
}
