#!/usr/bin/env node

import { Command } from 'commander';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContainer } from './di';
import type { BuildOptions } from './types';

const program = new Command();

program
  .name('dinomlx')
  .description('DinoMLX SSG CLI')
  .version('1.0.0');

program
  .command('build')
  .description('Build the static site')
  .option('--out-dir <path>', 'Output directory', 'dist')
  .option('--cache-dir <path>', 'Cache directory', '.dinomlx/cache')
  .option('--base-path <path>', 'Base path for assets', '')
  .option('--src-root <path>', 'Source root directory', 'src')
  .option('--no-minify', 'Disable minification')
  .action(async (options) => {
    try {
      const buildOptions: BuildOptions = {
        outDir: resolve(process.cwd(), options.outDir),
        cacheDir: resolve(process.cwd(), options.cacheDir),
        basePath: options.basePath,
        srcRoot: resolve(process.cwd(), options.srcRoot),
        minify: options.minify
      };

      console.log('Starting build...');
      const container = createContainer(buildOptions);
      const builder = container.get('builder');

      await builder.build();
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  });

export const run = () => program.parse(process.argv);

// Only run if executed directly
const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === currentFile;

if (isMain) {
  run();
}
