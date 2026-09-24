import type { StyleSheet } from '../../core/style/types.ts';
import lead from './lead.json' with { type: 'json' };
import open from './open.json' with { type: 'json' };
import power from './power.json' with { type: 'json' };
import thumb from './thumb.json' with { type: 'json' };
import whammy from './whammy.json' with { type: 'json' };

export const STYLES: Record<string, StyleSheet> = {
  power: power as StyleSheet,
  open: open as StyleSheet,
  lead: lead as StyleSheet,
  thumb: thumb as StyleSheet,
  whammy: whammy as StyleSheet,
};
