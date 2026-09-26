import { issueUrl } from '../core/report/issueReport';
import { readErrorLog } from './errorLog';

export function reportProblemUrl(): string {
  return issueUrl({
    version: __APP_VERSION__,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    touch: navigator.maxTouchPoints > 0,
    path: window.location.pathname,
    errors: readErrorLog(),
  });
}

export function openReportProblem(): void {
  window.open(reportProblemUrl(), '_blank', 'noopener');
}
