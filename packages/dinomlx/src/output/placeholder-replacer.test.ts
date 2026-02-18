import { describe, test, expect } from 'vitest';
import { replacePlaceholders } from './placeholder-replacer.ts';

describe('replacePlaceholders', () => {
  test('replaces critical CSS placeholder with style tag', () => {
    const html = '<html><head>$#critical-css</head><body></body></html>';
    const result = replacePlaceholders(html, '.a{color:red}', '', '');
    expect(result).toContain('<style>.a{color:red}</style>');
    expect(result).not.toContain('$#critical-css');
  });

  test('replaces non-critical CSS placeholder with preload link', () => {
    const html = '<html><head>$#non-critical-css</head><body></body></html>';
    const result = replacePlaceholders(html, '', '.b{color:blue}', '');
    expect(result).toContain('rel="preload"');
    expect(result).toContain('href="styles.css"');
    expect(result).not.toContain('$#non-critical-css');
  });

  test('replaces both placeholders', () => {
    const html = '<html><head>$#critical-css\n$#non-critical-css</head><body></body></html>';
    const result = replacePlaceholders(html, '.a{}', '.b{}', '');
    expect(result).toContain('<style>.a{}</style>');
    expect(result).toContain('href="styles.css"');
  });

  test('auto-injects into head when no placeholders', () => {
    const html = '<html><head></head><body></body></html>';
    const result = replacePlaceholders(html, '.a{}', '.b{}', '');
    expect(result).toContain('<style>.a{}</style>');
    expect(result).toContain('styles.css');
  });

  test('does nothing when no CSS and no placeholders', () => {
    const html = '<html><head></head><body></body></html>';
    const result = replacePlaceholders(html, '', '', '');
    expect(result).toBe(html);
  });

  test('applies base path to CSS file reference', () => {
    const html = '<html><head>$#non-critical-css</head><body></body></html>';
    const result = replacePlaceholders(html, '', '.b{}', '/my-blog');
    expect(result).toContain('href="/my-blog/styles.css"');
  });

  test('handles empty critical CSS with placeholder', () => {
    const html = '<html><head>$#critical-css</head><body></body></html>';
    const result = replacePlaceholders(html, '', '', '');
    expect(result).not.toContain('<style>');
    expect(result).not.toContain('$#critical-css');
  });
});
