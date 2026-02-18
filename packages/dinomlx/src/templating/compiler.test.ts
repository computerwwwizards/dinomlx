import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { compileTemplate } from './compiler.ts';

describe('compileTemplate', () => {
  let templatesDir: string;

  beforeEach(async () => {
    templatesDir = await mkdtemp(join(tmpdir(), 'dinomlx-compiler-'));
  });

  afterEach(async () => {
    await rm(templatesDir, { recursive: true, force: true });
  });

  test('returns HTML unchanged when no components', async () => {
    const html = '<div><p>Hello</p></div>';
    const result = await compileTemplate(html, templatesDir);
    expect(result).toContain('<p>Hello</p>');
  });

  test('expands a simple component', async () => {
    await writeFile(join(templatesDir, 'navbar.html'), '<nav>Navigation</nav>');
    const html = '<div><c-navbar></c-navbar></div>';
    const result = await compileTemplate(html, templatesDir);
    expect(result).toContain('<nav>Navigation</nav>');
    expect(result).not.toContain('c-navbar');
  });

  test('expands nested components', async () => {
    await writeFile(join(templatesDir, 'header.html'), '<header><c-logo></c-logo></header>');
    await writeFile(join(templatesDir, 'logo.html'), '<img src="logo.png" />');
    const html = '<div><c-header></c-header></div>';
    const result = await compileTemplate(html, templatesDir);
    expect(result).toContain('<img src="logo.png"');
    expect(result).not.toContain('c-header');
    expect(result).not.toContain('c-logo');
  });

  test('expands component in subdirectory', async () => {
    await mkdir(join(templatesDir, 'atoms'), { recursive: true });
    await writeFile(join(templatesDir, 'atoms', 'button.html'), '<button>Click</button>');
    const html = '<div><c-atoms-button></c-atoms-button></div>';
    const result = await compileTemplate(html, templatesDir);
    expect(result).toContain('<button>Click</button>');
  });

  test('detects circular references', async () => {
    await writeFile(join(templatesDir, 'a.html'), '<div><c-b></c-b></div>');
    await writeFile(join(templatesDir, 'b.html'), '<div><c-a></c-a></div>');
    const html = '<div><c-a></c-a></div>';
    await expect(compileTemplate(html, templatesDir)).rejects.toThrow('Circular component reference');
  });

  test('throws when template not found', async () => {
    const html = '<div><c-nonexistent></c-nonexistent></div>';
    await expect(compileTemplate(html, templatesDir)).rejects.toThrow('Template not found');
  });

  test('allows same component used multiple times (non-circular)', async () => {
    await writeFile(join(templatesDir, 'btn.html'), '<button>OK</button>');
    const html = '<div><c-btn></c-btn><c-btn></c-btn></div>';
    const result = await compileTemplate(html, templatesDir);
    const matches = result.match(/<button>OK<\/button>/g);
    expect(matches).toHaveLength(2);
  });
});
