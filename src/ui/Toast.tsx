import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';
import { Text } from './Text';

export type ToastProps = {
  children: ReactNode;
  action?: ReactNode;
};

export function Toast({ children, action }: ToastProps) {
  return createPortal(
    <div className={styles.toast} role="status">
      <Text size="small">{children}</Text>
      {action}
    </div>,
    document.body,
  );
}
