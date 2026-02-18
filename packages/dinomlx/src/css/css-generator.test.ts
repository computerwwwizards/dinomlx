import { describe, test, expect } from 'vitest';
import { generateCSS } from './css-generator.ts';
import type { CSSLayer } from '../core/types.ts';

function makeCSSMap(entries: Partial<Record<CSSLayer, string[]>>): Map<CSSLayer, string[]> {
  const map = new Map<CSSLayer, string[]>();
  for (const layer of ['global', 'layout', 'components', 'utils'] as CSSLayer[]) {
    map.set(layer, entries[layer] ?? []);
  }
  return map;
}

describe('generateCSS', () => {
  test('generates empty string when no CSS', () => {
    const result = generateCSS(makeCSSMap({}));
    expect(result.css).toBe('');
  });

  test('wraps CSS in @layer declarations', () => {
    const result = generateCSS(makeCSSMap({
      utils: ['.text-red { color: red; }'],
    }));
    expect(result.css).toContain('@layer');
    expect(result.css).toContain('utils');
    expect(result.css).toContain('color');
  });

  test('includes layer order declaration', () => {
    const result = generateCSS(makeCSSMap({
      global: ['* { margin: 0; }'],
    }));
    expect(result.css).toContain('@layer global');
  });

  test('minifies the output', () => {
    const result = generateCSS(makeCSSMap({
      components: ['.card {\n  padding:   1rem;\n  margin:   0;\n}'],
    }));
    expect(result.css).not.toContain('   ');
  });

  test('handles multiple layers', () => {
    const result = generateCSS(makeCSSMap({
      global: ['* { box-sizing: border-box; }'],
      components: ['.btn { display: inline-flex; }'],
      utils: ['.hidden { display: none; }'],
    }));
    expect(result.css).toContain('global');
    expect(result.css).toContain('components');
    expect(result.css).toContain('utils');
  });
});
