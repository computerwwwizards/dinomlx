import { glob } from 'glob';
import { resolve, basename, relative, dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { Compiler, BuildOptions } from './types';
import { CssRegistry } from './services/CssRegistry';
import { HtmlParserService } from './services/HtmlParser';
import { IrGenerator } from './services/IrGenerator';
import { Assembler } from './services/Assembler';

export class DinomlxCompiler implements Compiler {
  constructor(
    private cssRegistry: CssRegistry,
    private parser: HtmlParserService,
  ) {}

  async build(options: BuildOptions): Promise<void> {
    const { srcRoot, outDir, cacheDir, minify } = options;

    console.log(`Building from ${srcRoot} to ${outDir}...`);

    // 1. Initialize Registry
    const candidatesDir = resolve(srcRoot, 'candidates');
    console.log(`Loading CSS candidates from ${candidatesDir}...`);
    await this.cssRegistry.loadFromDir(candidatesDir);

    // 2. Prepare Services
    const irGenerator = new IrGenerator(this.parser, srcRoot);
    const assembler = new Assembler(this.parser, srcRoot);

    // 3. Find Pages
    const pagesDir = resolve(srcRoot, 'pages');
    const pages = await glob(resolve(pagesDir, '**/*.html'));
    console.log(`Found ${pages.length} pages.`);

    // 4. Process each page
    for (const pagePath of pages) {
      const relativePath = relative(pagesDir, pagePath);
      console.log(`Processing page: ${relativePath}`);

      // Generate IR
      const ir = await irGenerator.generatePageIr(pagePath);

      // Save IR
      const irOutPath = resolve(
        cacheDir,
        'ir',
        'pages',
        relativePath.replace(/\.html$/, '.json'),
      );
      await mkdir(dirname(irOutPath), { recursive: true });
      await writeFile(irOutPath, JSON.stringify(ir, null, 2));

      // Calculate Critical CSS
      const candidates = new Set(ir.above_the_fold.own_candidates);
      const { critical } = await this.cssRegistry.getPromiseByCandidates(
        candidates,
        'critical',
      );

      // Assemble HTML
      let html = await assembler.assemble(ir);

      // Inject Critical CSS
      if (critical) {
        let criticalCss = critical;
        if (minify) {
          criticalCss = criticalCss
            .replace(/\s+/g, ' ')
            .replace(/\s*([{}:;,])\s*/g, '$1');
        }
        const styleTag = `<style>${criticalCss}</style>`;
        if (html.search(/<g-critical-css\s*\/?>/i) !== -1) {
          html = html.replace(/<g-critical-css\s*\/?>/i, styleTag);
        } else if (html.includes('</head>')) {
          html = html.replace('</head>', `${styleTag}</head>`);
        } else {
          // If no head, maybe prepend?
          html = styleTag + html;
        }
      }

      // Handle deferable placeholder
      html = html.replace(/<g-deferable-css-external\s*\/?>/i, '');

      // Minify HTML
      if (minify) {
        html = html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
      }

      // Write Output
      const outFile = resolve(outDir, relativePath);
      await mkdir(dirname(outFile), { recursive: true });
      await writeFile(outFile, html);
    }

    console.log('Build complete.');
  }
}
