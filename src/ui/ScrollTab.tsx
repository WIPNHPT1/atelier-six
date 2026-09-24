/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- a region that scrolls sideways must be reachable by keyboard (axe: scrollable-region-focusable) */
export type ScrollTabProps = { label: string; className?: string | undefined; children: string };

// Plain-text tab in a box that can scroll sideways on small screens.
export function ScrollTab({ label, className, children }: ScrollTabProps) {
  return (
    <pre className={className} aria-label={label} tabIndex={0}>
      {children}
    </pre>
  );
}
