import { describe, expect, it } from 'vitest';
import {
  browserName,
  deviceType,
  diagnostics,
  issueUrl,
  lastLines,
  type ReportContext,
} from './issueReport';

const chromeUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const ctx: ReportContext = {
  version: '1.0.0',
  userAgent: chromeUa,
  screenWidth: 1440,
  screenHeight: 900,
  touch: false,
  path: '/lesson/m1-l1',
  errors: [],
};

describe('browserName', () => {
  it.each([
    [chromeUa, 'Chrome 140'],
    ['Mozilla/5.0 Chrome/140.0 Safari/537.36 Edg/140.0', 'Edge 140'],
    ['Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/141.0', 'Firefox 141'],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Safari 18',
    ],
    ['curl/8.0', 'Unknown browser'],
  ])('%s → %s', (ua, expected) => {
    expect(browserName(ua)).toBe(expected);
  });
});

describe('deviceType', () => {
  it('uses touch and width', () => {
    expect(deviceType(1440, false)).toBe('desktop');
    expect(deviceType(390, true)).toBe('phone');
    expect(deviceType(1024, true)).toBe('tablet');
  });
});

describe('lastLines', () => {
  it('keeps only the last 20 lines', () => {
    const lines = Array.from({ length: 25 }, (_, i) => `e${String(i)}`);
    const kept = lastLines(lines);
    expect(kept).toHaveLength(20);
    expect(kept[0]).toBe('e5');
    expect(lastLines(['a'])).toEqual(['a']);
  });
});

describe('diagnostics', () => {
  it('lists version, browser, device, screen and errors', () => {
    const text = diagnostics({ ...ctx, errors: ['TypeError: boom'] });
    expect(text).toContain('App version: 1.0.0');
    expect(text).toContain('Browser: Chrome 140');
    expect(text).toContain('Device: desktop');
    expect(text).toContain('Screen: 1440×900');
    expect(text).toContain('Screen in app: /lesson/m1-l1');
    expect(text).toContain('TypeError: boom');
  });

  it('says none when there are no errors', () => {
    expect(diagnostics(ctx)).toContain('(none)');
  });
});

describe('issueUrl', () => {
  it('opens the bug-report template pre-filled', () => {
    const url = new URL(issueUrl(ctx));
    expect(url.origin + url.pathname).toBe('https://github.com/WIPNHPT1/atelier-six/issues/new');
    expect(url.searchParams.get('template')).toBe('bug_report.yml');
    expect(url.searchParams.get('device')).toBe('desktop, Chrome 140');
    expect(url.searchParams.get('diagnostics')).toContain('App version: 1.0.0');
  });
});
