import { describe, test, expect } from 'vitest';
import { scanCandidates } from './candidate-scanner.ts';
import type { CandidateRegistry } from '../core/types.ts';

function makeRegistry(names: string[]): CandidateRegistry {
  const candidates = new Map();
  for (const name of names) {
    candidates.set(name, { name, layer: 'utils', criticalCSS: `.${name} {}`, nonCriticalCSS: null });
  }
  return { candidates };
}

describe('scanCandidates', () => {
  test('finds used candidates from class attributes', () => {
    const registry = makeRegistry(['text-red', 'bg-blue', 'unused']);
    const html = '<div class="text-red"><p class="bg-blue">Hello</p></div>';
    const used = scanCandidates(html, registry);
    expect(used).toEqual(new Set(['text-red', 'bg-blue']));
  });

  test('ignores classes not in registry', () => {
    const registry = makeRegistry(['text-red']);
    const html = '<div class="text-red custom-class other">Hello</div>';
    const used = scanCandidates(html, registry);
    expect(used).toEqual(new Set(['text-red']));
  });

  test('returns empty set when no classes match', () => {
    const registry = makeRegistry(['text-red']);
    const html = '<div>No classes</div>';
    const used = scanCandidates(html, registry);
    expect(used.size).toBe(0);
  });

  test('deduplicates candidates used multiple times', () => {
    const registry = makeRegistry(['text-red']);
    const html = '<div class="text-red"><p class="text-red">Hi</p></div>';
    const used = scanCandidates(html, registry);
    expect(used.size).toBe(1);
  });

  test('handles multiple classes on single element', () => {
    const registry = makeRegistry(['a', 'b', 'c']);
    const html = '<div class="a b c">Hello</div>';
    const used = scanCandidates(html, registry);
    expect(used).toEqual(new Set(['a', 'b', 'c']));
  });
});
