import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  CRITICAL_CSS_WARN_THRESHOLD,
  CRITICAL_CSS_HARD_LIMIT,
  type BuildConfig,
  type BuildResult,
  type PageBuildResult,
} from '../core/types.ts';
import { scanPages } from '../routing/page-scanner.ts';
import { buildCandidateRegistry } from '../css/candidate-registry.ts';
import { parseAboveTheFold, splitCriticalCSS } from '../css/critical-css.ts';
import { compileTemplate } from '../templating/compiler.ts';
import { scanCandidates } from '../css/candidate-scanner.ts';
import { collectCSS } from '../css/css-collector.ts';
import { generateCSS } from '../css/css-generator.ts';
import { replacePlaceholders } from '../output/placeholder-replacer.ts';
import { emitBuild } from '../output/emitter.ts';

export async function runBuildPipeline(config: BuildConfig): Promise<BuildResult> {
  const pagesDir = join(config.srcRoot, 'pages');
  const templatesDir = join(config.srcRoot, 'templates');
  const candidatesDir = join(config.srcRoot, 'candidates');

  const pages = await scanPages(pagesDir);
  if (pages.length === 0) {
    console.warn('Warning: No pages found in', pagesDir);
    return { pages: [], nonCriticalCSS: '' };
  }

  const registry = await buildCandidateRegistry(candidatesDir);
  const criticalCandidates = await parseAboveTheFold(config.srcRoot, templatesDir, registry);

  const allNonCriticalChunks = new Map<string, Map<string, string[]>>();
  const pageResults: PageBuildResult[] = [];

  for (const page of pages) {
    const rawHTML = await readFile(page.absolutePath, 'utf-8');
    const expandedHTML = await compileTemplate(rawHTML, templatesDir);
    const usedCandidates = scanCandidates(expandedHTML, registry);
    const collected = collectCSS(usedCandidates, registry);
    const { critical, nonCritical } = splitCriticalCSS(collected, criticalCandidates, registry);

    const criticalGenerated = generateCSS(critical);
    const nonCriticalGenerated = generateCSS(nonCritical);

    for (const [layer, chunks] of nonCritical) {
      if (!allNonCriticalChunks.has(layer)) {
        allNonCriticalChunks.set(layer, new Map());
      }
      const layerMap = allNonCriticalChunks.get(layer)!;
      for (const chunk of chunks) {
        layerMap.set(chunk, chunks);
      }
    }

    const finalHTML = replacePlaceholders(
      expandedHTML,
      criticalGenerated.css,
      nonCriticalGenerated.css,
      config.basePath
    );

    const criticalSize = Buffer.byteLength(criticalGenerated.css, 'utf-8');
    if (criticalSize > CRITICAL_CSS_HARD_LIMIT) {
      console.warn(
        `Warning: Critical CSS for ${page.relativePath} exceeds 4KB (${criticalSize} bytes)`
      );
    } else if (criticalSize > CRITICAL_CSS_WARN_THRESHOLD) {
      console.info(
        `Info: Critical CSS for ${page.relativePath} exceeds 2KB (${criticalSize} bytes)`
      );
    }

    pageResults.push({
      relativePath: page.relativePath,
      html: finalHTML,
      criticalCSSSize: criticalSize,
    });
  }

  const globalNonCritical = buildGlobalNonCriticalCSS(pages, config, registry, criticalCandidates);
  const buildResult: BuildResult = {
    pages: pageResults,
    nonCriticalCSS: (await globalNonCritical).css,
  };

  await emitBuild(buildResult, config);

  console.info(`Build complete: ${pageResults.length} page(s) written to ${config.outDir}`);
  return buildResult;
}

async function buildGlobalNonCriticalCSS(
  pages: { absolutePath: string }[],
  config: BuildConfig,
  registry: import('../core/types.ts').CandidateRegistry,
  criticalCandidates: Set<string>
): Promise<import('../core/types.ts').GeneratedCSS> {
  const templatesDir = join(config.srcRoot, 'templates');
  const allUsed = new Set<string>();

  for (const page of pages) {
    const rawHTML = await readFile(page.absolutePath, 'utf-8');
    const expandedHTML = await compileTemplate(rawHTML, templatesDir);
    const used = scanCandidates(expandedHTML, registry);
    for (const name of used) allUsed.add(name);
  }

  const collected = collectCSS(allUsed, registry);
  const { nonCritical } = splitCriticalCSS(collected, criticalCandidates, registry);
  return generateCSS(nonCritical);
}
