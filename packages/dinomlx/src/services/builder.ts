import { glob } from 'glob';
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import type { BuildOptions, HTMLTemplateCompiler } from '../types';

export class DinomlxBuilder {
  constructor(
    private options: BuildOptions,
    private compilerFactory: () => HTMLTemplateCompiler,
  ) {}

  async build() {
    console.log('Building with options:', this.options);

    // Ensure output directory exists
    await mkdir(this.options.outDir, { recursive: true });

    // Find HTML files
    // glob expects forward slashes, so on windows this might need normalization if srcRoot has backslashes
    const pattern = join(this.options.srcRoot, '**/*.html').replace(/\\/g, '/');
    const files = await glob(pattern);

    console.log(`Found ${files.length} files.`);

    for (const file of files) {
      console.log(`Processing ${file}...`);
      const content = await readFile(file, 'utf-8');

      const relPath = relative(this.options.srcRoot, file);
      const outPath = join(this.options.outDir, relPath);

      await mkdir(dirname(outPath), { recursive: true });

      const compiler = this.compilerFactory();
      await compiler.from(content).saveTo(outPath).compile();
    }

    console.log('Build complete.');
  }
}
