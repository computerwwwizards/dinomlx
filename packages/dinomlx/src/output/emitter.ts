import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { NON_CRITICAL_CSS_FILENAME, type BuildConfig, type BuildResult } from '../core/types.ts';

export async function emitBuild(result: BuildResult, config: BuildConfig): Promise<void> {
  await mkdir(config.outDir, { recursive: true });

  for (const page of result.pages) {
    const outPath = join(config.outDir, page.relativePath);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, page.html, 'utf-8');
  }

  if (result.nonCriticalCSS) {
    const cssPath = join(config.outDir, NON_CRITICAL_CSS_FILENAME);
    await writeFile(cssPath, result.nonCriticalCSS, 'utf-8');
  }
}
