
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { HTMLTemplateCompilerImpl } from '../src/html-compiler';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

const EXAMPLE_SRC = join(__dirname, '../example/src');
const OUTPUT_DIR = join(__dirname, '../test-output');

describe('HTMLTemplateCompilerImpl', () => {
  beforeAll(async () => {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  afterAll(async () => {
    // await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  });

  it('should compile a simple template and extract candidates', async () => {
    const compiler = new HTMLTemplateCompilerImpl();
    const src = join(EXAMPLE_SRC, 'templates/navbar.html');
    const target = join(OUTPUT_DIR, 'templates');

    await compiler
      .from(src)
      .saveTo(target)
      .compile();

    // Verify output files exist
    const htmlExists = await fs.stat(join(target, 'navbar.html')).then(() => true).catch(() => false);
    const jsonExists = await fs.stat(join(target, 'navbar.candidates.json')).then(() => true).catch(() => false);

    expect(htmlExists).toBe(true);
    expect(jsonExists).toBe(true);

    // Verify candidates content
    const jsonContent = JSON.parse(await fs.readFile(join(target, 'navbar.candidates.json'), 'utf-8'));
    expect(jsonContent.candidates).toContain('flex');
    expect(jsonContent.candidates).toContain('button-primary');
  });

  it('should compile a page and generate IR metadata', async () => {
    const compiler = new HTMLTemplateCompilerImpl();
    const src = join(EXAMPLE_SRC, 'pages/index.html');
    const target = join(OUTPUT_DIR, 'pages');

    await compiler
      .from(src)
      .saveTo(target)
      .compile();

    // Verify output files exist
    const htmlExists = await fs.stat(join(target, 'index.html')).then(() => true).catch(() => false);
    const jsonExists = await fs.stat(join(target, 'index.json')).then(() => true).catch(() => false);

    expect(htmlExists).toBe(true);
    expect(jsonExists).toBe(true);

    // Verify IR structure
    const jsonContent = JSON.parse(await fs.readFile(join(target, 'index.json'), 'utf-8'));

    // Check i18n
    const i18nKeys = Object.keys(jsonContent.i18n);
    expect(i18nKeys.length).toBeGreaterThan(0);
    // Expect hash_title and hash_click (names may vary due to random hash, but keys should be present)
    // Wait, my implementation uses `hash_[key]` for i18n, so it's deterministic: `hash_title`, `hash_click`.
    expect(jsonContent.i18n).toHaveProperty('hash_title');
    expect(jsonContent.i18n.hash_title).toHaveProperty('spanish', 'Principal');
    expect(jsonContent.i18n.hash_title).toHaveProperty('english', 'Home');

    // Check components
    const dataKeys = Object.keys(jsonContent.data);
    expect(dataKeys.length).toBeGreaterThan(0);

    // Check if root component (hash_index) exists
    // My implementation tries to detect root component and name it hash_index
    expect(jsonContent.data).toHaveProperty('hash_index');

    const rootData = jsonContent.data.hash_index;
    // expect(rootData.slots).toHaveProperty('default'); // It has named slots, so default might not be present

    // In index.html: <c-basic-layout> <c-slot-head>...</c-slot-head> <c-slot-body>...</c-slot-body> </c-basic-layout>
    // So slots should be head and body.
    expect(rootData.slots).toHaveProperty('head');
    expect(rootData.slots).toHaveProperty('body');

    // Check transformed HTML content
    const transformedHtml = await fs.readFile(join(target, 'index.html'), 'utf-8');
    expect(transformedHtml).toContain('$#{hash_index}');
  });
});
