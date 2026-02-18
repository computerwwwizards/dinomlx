import { glob } from 'glob';
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import type { BuildOptions, HTMLTemplateCompiler, CSSRegister } from '../types';

export class DinomlxBuilder {
  constructor(
    private options: BuildOptions,
    private compilerFactory: () => HTMLTemplateCompiler,
    private cssRegister: CSSRegister
  ) {}

  async build() {
    console.log('Building with options:', this.options);

    // Ensure output and cache directories exist
    await mkdir(this.options.outDir, { recursive: true });
    await mkdir(this.options.cacheDir, { recursive: true });

    // Load existing CSS registry if any
    await this.cssRegister.load();

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
      await compiler
        .from(content)
        .saveTo(outPath)
        .compile();
    }

    // Save CSS registry
    await this.cssRegister.save();

    console.log('Build complete.');
  }
}
