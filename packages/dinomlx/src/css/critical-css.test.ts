import { describe, test, expect } from 'vitest';
import { splitCriticalCSS } from './critical-css.ts';
import type { CSSLayer, CandidateRegistry, CollectedCSS } from '../core/types.ts';

function makeCollectedCSS(
  critical: Partial<Record<CSSLayer, string[]>>,
  nonCritical: Partial<Record<CSSLayer, string[]>>
): CollectedCSS {
  const crit = new Map<CSSLayer, string[]>();
  const nonCrit = new Map<CSSLayer, string[]>();
  for (const layer of ['global', 'layout', 'components', 'utils'] as CSSLayer[]) {
    crit.set(layer, critical[layer] ?? []);
    nonCrit.set(layer, nonCritical[layer] ?? []);
  }
  return { critical: crit, nonCritical: nonCrit };
}

function makeRegistry(entries: { name: string; layer: CSSLayer; criticalCSS: string }[]): CandidateRegistry {
  const candidates = new Map();
  for (const entry of entries) {
    candidates.set(entry.name, {
      name: entry.name,
      layer: entry.layer,
      criticalCSS: entry.criticalCSS,
      nonCriticalCSS: null,
    });
  }
  return { candidates };
}

describe('splitCriticalCSS', () => {
  test('puts critical candidate CSS into critical bucket', () => {
    const registry = makeRegistry([
      { name: 'text-red', layer: 'utils', criticalCSS: '.text-red { color: red; }' },
    ]);
    const collected = makeCollectedCSS(
      { utils: ['.text-red { color: red; }'] },
      {}
    );
    const criticalCandidates = new Set(['text-red']);

    const result = splitCriticalCSS(collected, criticalCandidates, registry);
    expect(result.critical.get('utils')).toEqual(['.text-red { color: red; }']);
  });

  test('puts non-critical candidate CSS into non-critical bucket', () => {
    const registry = makeRegistry([
      { name: 'text-red', layer: 'utils', criticalCSS: '.text-red { color: red; }' },
      { name: 'bg-blue', layer: 'utils', criticalCSS: '.bg-blue { background: blue; }' },
    ]);
    const collected = makeCollectedCSS(
      { utils: ['.text-red { color: red; }', '.bg-blue { background: blue; }'] },
      {}
    );
    const criticalCandidates = new Set(['text-red']);

    const result = splitCriticalCSS(collected, criticalCandidates, registry);
    expect(result.critical.get('utils')).toEqual(['.text-red { color: red; }']);
    expect(result.nonCritical.get('utils')).toContain('.bg-blue { background: blue; }');
  });

  test('non-critical CSS from collected always goes to non-critical', () => {
    const registry = makeRegistry([
      { name: 'text-red', layer: 'utils', criticalCSS: '.text-red { color: red; }' },
    ]);
    const collected = makeCollectedCSS(
      {},
      { utils: ['.text-red:hover { color: darkred; }'] }
    );
    const criticalCandidates = new Set(['text-red']);

    const result = splitCriticalCSS(collected, criticalCandidates, registry);
    expect(result.nonCritical.get('utils')).toContain('.text-red:hover { color: darkred; }');
  });

  test('empty critical candidates means all goes to non-critical', () => {
    const registry = makeRegistry([
      { name: 'text-red', layer: 'utils', criticalCSS: '.text-red { color: red; }' },
    ]);
    const collected = makeCollectedCSS(
      { utils: ['.text-red { color: red; }'] },
      {}
    );
    const criticalCandidates = new Set<string>();

    const result = splitCriticalCSS(collected, criticalCandidates, registry);
    expect(result.critical.get('utils')).toEqual([]);
    expect(result.nonCritical.get('utils')).toContain('.text-red { color: red; }');
  });
});
