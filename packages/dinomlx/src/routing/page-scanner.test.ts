import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { scanPages } from './page-scanner.ts';

describe('scanPages', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'dinomlx-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test('returns empty array for empty directory', async () => {
    const pages = await scanPages(tempDir);
    expect(pages).toEqual([]);
  });

  test('finds HTML files at root level', async () => {
    await writeFile(join(tempDir, 'index.html'), '<html></html>');
    await writeFile(join(tempDir, 'about.html'), '<html></html>');

    const pages = await scanPages(tempDir);
    expect(pages).toHaveLength(2);
    expect(pages[0].relativePath).toBe('about.html');
    expect(pages[1].relativePath).toBe('index.html');
  });

  test('finds HTML files in subdirectories', async () => {
    await mkdir(join(tempDir, 'blog'), { recursive: true });
    await writeFile(join(tempDir, 'index.html'), '<html></html>');
    await writeFile(join(tempDir, 'blog', 'post.html'), '<html></html>');

    const pages = await scanPages(tempDir);
    expect(pages).toHaveLength(2);
    expect(pages.map((p) => p.relativePath)).toEqual(['blog/post.html', 'index.html']);
  });

  test('ignores non-HTML files', async () => {
    await writeFile(join(tempDir, 'index.html'), '<html></html>');
    await writeFile(join(tempDir, 'style.css'), 'body {}');
    await writeFile(join(tempDir, 'script.js'), '');

    const pages = await scanPages(tempDir);
    expect(pages).toHaveLength(1);
    expect(pages[0].relativePath).toBe('index.html');
  });

  test('includes absolute paths', async () => {
    await writeFile(join(tempDir, 'index.html'), '<html></html>');

    const pages = await scanPages(tempDir);
    expect(pages[0].absolutePath).toBe(join(tempDir, 'index.html'));
  });
});
