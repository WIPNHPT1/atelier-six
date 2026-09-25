type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/** Cross-fades a finish switch's background texture/gradient via the View Transitions
 * API. Falls back to an instant swap when unsupported or motion is off. */
export function withFinishMorph(motionEnabled: boolean, apply: () => void): void {
  const doc = document as ViewTransitionDocument;
  if (!motionEnabled || typeof doc.startViewTransition !== 'function') {
    apply();
    return;
  }
  document.documentElement.setAttribute('data-finish-morph', '');
  const transition = doc.startViewTransition(apply);
  void transition.finished.finally(() => {
    document.documentElement.removeAttribute('data-finish-morph');
  });
}
