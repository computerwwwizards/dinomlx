import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolveTemplatePath, resolveTemplatePathWithOverride } from './resolver.ts';

describe('resolveTemplatePath', () => {
  test('single-segment name maps to root file', () => {
    const result = resolveTemplatePath('navbar', '/templates');
    expect(result).toBe('/templates/navbar.html');
  });

  test('two-segment name maps to directory/file', () => {
    const result = resolveTemplatePath('atoms-button', '/templates');
    expect(result).toBe('/templates/atoms/button.html');
  });

  test('multi-segment name maps to nested directories', () => {
    const result = resolveTemplatePath('ui-cards-hero', '/templates');
    expect(result).toBe('/templates/ui/cards/hero.html');
  });
});

describe('resolveTemplatePathWithOverride', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'dinomlx-resolver-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test('resolves default path when no override', async () => {
    await writeFile(join(tempDir, 'navbar.html'), '<nav></nav>');
    const result = await resolveTemplatePathWithOverride('navbar', tempDir, undefined);
    expect(result).toBe(join(tempDir, 'navbar.html'));
  });

  test('uses override path when provided', async () => {
    await mkdir(join(tempDir, 'custom'), { recursive: true });
    await writeFile(join(tempDir, 'custom', 'nav.html'), '<nav></nav>');
    const result = await resolveTemplatePathWithOverride('navbar', tempDir, 'custom/nav.html');
    expect(result).toBe(join(tempDir, 'custom', 'nav.html'));
  });

  test('throws when default template not found', async () => {
    await expect(
      resolveTemplatePathWithOverride('missing', tempDir, undefined)
    ).rejects.toThrow('Template not found for component "missing"');
  });

  test('throws when override template not found', async () => {
    await expect(
      resolveTemplatePathWithOverride('navbar', tempDir, 'nonexistent.html')
    ).rejects.toThrow('Template source override not found');
  });
});
