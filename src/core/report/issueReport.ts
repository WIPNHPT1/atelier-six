export const ISSUE_BASE_URL = 'https://github.com/WIPNHPT1/atelier-six/issues/new';
export const MAX_LOG_LINES = 20;

export type ReportContext = {
  version: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  touch: boolean;
  path: string;
  errors: string[];
};

export function browserName(userAgent: string): string {
  const rules: Array<[RegExp, string]> = [
    [/Edg\/(\d+)/, 'Edge'],
    [/Firefox\/(\d+)/, 'Firefox'],
    [/Chrome\/(\d+)/, 'Chrome'],
    [/Version\/(\d+)[\d.]* .*Safari/, 'Safari'],
  ];
  for (const [pattern, name] of rules) {
    const match = pattern.exec(userAgent);
    if (match) return `${name} ${match[1] ?? ''}`.trim();
  }
  return 'Unknown browser';
}

export function deviceType(screenWidth: number, touch: boolean): 'phone' | 'tablet' | 'desktop' {
  if (!touch) return 'desktop';
  return screenWidth < 600 ? 'phone' : 'tablet';
}

export function lastLines(lines: string[], max = MAX_LOG_LINES): string[] {
  return lines.slice(Math.max(0, lines.length - max));
}

export function diagnostics(ctx: ReportContext): string {
  const log = lastLines(ctx.errors);
  return [
    `App version: ${ctx.version}`,
    `Browser: ${browserName(ctx.userAgent)}`,
    `Device: ${deviceType(ctx.screenWidth, ctx.touch)}`,
    `Screen: ${String(ctx.screenWidth)}×${String(ctx.screenHeight)}`,
    `Screen in app: ${ctx.path}`,
    '',
    'Recent errors:',
    ...(log.length > 0 ? log : ['(none)']),
  ].join('\n');
}

export function issueUrl(ctx: ReportContext): string {
  const params = new URLSearchParams({
    template: 'bug_report.yml',
    device: `${deviceType(ctx.screenWidth, ctx.touch)}, ${browserName(ctx.userAgent)}`,
    diagnostics: diagnostics(ctx),
  });
  return `${ISSUE_BASE_URL}?${params.toString()}`;
}
