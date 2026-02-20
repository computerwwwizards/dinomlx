import { Command } from 'commander';
import { resolve } from 'node:path';
import { BuildOptions, Compiler } from './types';
import { container } from './container';

export function createCli() {
  const program = new Command();

  program.name('dinomlx').description('DINOMLX SSG CLI').version('1.0.0');

  program
    .command('build')
    .description('Build the static site')
    .option('--out-dir <dir>', 'Output directory', 'dist')
    .option('--cache-dir <dir>', 'Cache directory', '.dinomlx/cache')
    .option('--base-path <path>', 'Base URL path', '/')
    .option('--src-root <path>', 'Source directory', 'src')
    .option('--no-minify', 'Disable minification')
    .action(async (options) => {
      const buildOptions: BuildOptions = {
        outDir: resolve(process.cwd(), options.outDir),
        cacheDir: resolve(process.cwd(), options.cacheDir),
        basePath: options.basePath,
        srcRoot: resolve(process.cwd(), options.srcRoot),
        minify: options.minify !== false,
      };

      try {
        // @ts-ignore
        const compiler = container.get('Compiler') as Compiler;
        if (!compiler) {
          throw new Error('Compiler service not registered');
        }
        await compiler.build(buildOptions);
      } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
      }
    });

  return program;
}
