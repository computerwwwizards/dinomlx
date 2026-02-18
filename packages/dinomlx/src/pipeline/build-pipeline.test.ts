import { readFile, rm, access } from 'node:fs/promises';
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { runBuildPipeline } from './build-pipeline.ts';
import type { BuildConfig } from '../core/types.ts';

const FIXTURE_DIR = join(import.meta.dirname, '../../tests/fixtures/basic-site');

describe('build pipeline integration', () => {
  let outDir: string;
  let config: BuildConfig;

  beforeEach(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'dinomlx-build-'));
    config = {
      srcRoot: join(FIXTURE_DIR, 'src'),
      outDir,
      cacheDir: join(outDir, '.cache'),
      basePath: '',
    };
  });

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  test('produces correct number of output files', async () => {
    const result = await runBuildPipeline(config);
    expect(result.pages).toHaveLength(2);

    await access(join(outDir, 'index.html'));
    await access(join(outDir, 'about.html'));
  });

  test('expands all c- components in output HTML', async () => {
    const result = await runBuildPipeline(config);
    for (const page of result.pages) {
      expect(page.html).not.toMatch(/<c-[a-z]/);
    }
  });

  test('index.html contains expanded navbar', async () => {
    await runBuildPipeline(config);
    const indexHTML = await readFile(join(outDir, 'index.html'), 'utf-8');
    expect(indexHTML).toContain('<nav');
    expect(indexHTML).toContain('Home');
    expect(indexHTML).toContain('About');
  });

  test('index.html contains expanded button', async () => {
    await runBuildPipeline(config);
    const indexHTML = await readFile(join(outDir, 'index.html'), 'utf-8');
    expect(indexHTML).toContain('<button');
    expect(indexHTML).toContain('Click me');
  });

  test('critical CSS is inlined in style tag in head', async () => {
    await runBuildPipeline(config);
    const indexHTML = await readFile(join(outDir, 'index.html'), 'utf-8');
    expect(indexHTML).toContain('<style>');
    const headSection = indexHTML.split('</head>')[0];
    expect(headSection).toContain('<style>');
  });

  test('non-critical CSS is in external styles.css with preload link', async () => {
    await runBuildPipeline(config);
    const indexHTML = await readFile(join(outDir, 'index.html'), 'utf-8');
    expect(indexHTML).toContain('rel="preload"');
    expect(indexHTML).toContain('styles.css');

    await access(join(outDir, 'styles.css'));
    const cssContent = await readFile(join(outDir, 'styles.css'), 'utf-8');
    expect(cssContent.length).toBeGreaterThan(0);
  });

  test('CSS is wrapped in @layer declarations', async () => {
    await runBuildPipeline(config);
    const cssContent = await readFile(join(outDir, 'styles.css'), 'utf-8');
    expect(cssContent).toContain('@layer');
  });

  test('critical candidates from above-the-fold are inlined', async () => {
    await runBuildPipeline(config);
    const indexHTML = await readFile(join(outDir, 'index.html'), 'utf-8');
    const styleMatch = indexHTML.match(/<style>([\s\S]*?)<\/style>/);
    expect(styleMatch).not.toBeNull();
    const criticalCSS = styleMatch![1];
    expect(criticalCSS).toContain('color');
  });
});
