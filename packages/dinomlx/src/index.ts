#!/usr/bin/env node
import { Command } from 'commander';
import { buildCommand } from './cli/build.ts';

const program = new Command();

program
  .name('dinomlx')
  .description('DINOMLX Static Site Generator')
  .version('1.0.0');

program
  .command('build')
  .description('Build static site from source files')
  .option('--src-root <path>', 'Path to source files', 'src')
  .option('--out-dir <path>', 'Output directory', 'dist')
  .option('--cache-dir <path>', 'Cache directory', '.dinomlx/cache')
  .option('--base-path <path>', 'Base path prefix for assets', '')
  .action(buildCommand);

program.parse();
