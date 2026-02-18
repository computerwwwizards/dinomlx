import { describe, test, expect } from 'vitest';
import { parseHTML, extractComponents } from './parser.ts';

describe('parseHTML', () => {
  test('parses valid HTML', () => {
    const root = parseHTML('<div><p>Hello</p></div>');
    expect(root.querySelector('p')?.textContent).toBe('Hello');
  });
});

describe('extractComponents', () => {
  test('finds c- prefixed elements', () => {
    const root = parseHTML('<div><c-navbar></c-navbar></div>');
    const components = extractComponents(root);
    expect(components).toHaveLength(1);
    expect(components[0].tagName).toBe('c-navbar');
    expect(components[0].componentName).toBe('navbar');
  });

  test('finds nested c- elements', () => {
    const root = parseHTML('<div><c-header><c-logo></c-logo></c-header></div>');
    const components = extractComponents(root);
    expect(components).toHaveLength(2);
    expect(components[0].componentName).toBe('header');
    expect(components[1].componentName).toBe('logo');
  });

  test('extracts attributes', () => {
    const root = parseHTML('<c-button class="primary" data-size="lg"></c-button>');
    const components = extractComponents(root);
    expect(components[0].attributes).toEqual({ class: 'primary', 'data-size': 'lg' });
  });

  test('returns empty array when no components', () => {
    const root = parseHTML('<div><p>No components</p></div>');
    const components = extractComponents(root);
    expect(components).toEqual([]);
  });

  test('ignores non c- custom elements', () => {
    const root = parseHTML('<div><my-element></my-element><c-nav></c-nav></div>');
    const components = extractComponents(root);
    expect(components).toHaveLength(1);
    expect(components[0].componentName).toBe('nav');
  });

  test('handles multi-segment component names', () => {
    const root = parseHTML('<c-ui-cards-hero></c-ui-cards-hero>');
    const components = extractComponents(root);
    expect(components[0].componentName).toBe('ui-cards-hero');
    expect(components[0].tagName).toBe('c-ui-cards-hero');
  });
});
