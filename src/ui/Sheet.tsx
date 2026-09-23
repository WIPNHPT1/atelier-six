import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Sheet.module.css'
import { IconButton } from './IconButton'
import { CloseIcon } from './icons'
import { Heading } from './Heading'

export type SheetProps = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Sheet({ title, open, onClose, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    sheetRef.current?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <Heading level={3}>{title}</Heading>
          <IconButton label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        {children}
      </div>
    </>
  )
}
