import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { BuildConfig } from './types.ts';

interface CLIOptions {
  srcRoot?: string;
  outDir?: string;
  cacheDir?: string;
  basePath?: string;
}

export async function resolveConfig(cwd: string, options: CLIOptions): Promise<BuildConfig> {
  const srcRoot = resolve(cwd, options.srcRoot ?? 'src');
  const outDir = resolve(cwd, options.outDir ?? 'dist');
  const cacheDir = resolve(cwd, options.cacheDir ?? '.dinomlx/cache');
  const basePath = options.basePath ?? '';

  await access(srcRoot).catch(() => {
    throw new Error(`Source root does not exist: ${srcRoot}`);
  });

  return { srcRoot, outDir, cacheDir, basePath };
}
