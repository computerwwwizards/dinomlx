import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileTemplate } from '../templating/compiler.ts';
import { scanCandidates } from './candidate-scanner.ts';
import type { CSSLayer, CandidateRegistry, CollectedCSS } from '../core/types.ts';

export async function parseAboveTheFold(
  srcRoot: string,
  templatesDir: string,
  registry: CandidateRegistry
): Promise<Set<string>> {
  const aboveTheFoldPath = join(srcRoot, 'above-the-fold.html');

  let html: string;
  try {
    html = await readFile(aboveTheFoldPath, 'utf-8');
  } catch {
    console.warn(
      'Warning: above-the-fold.html not found. All CSS will be treated as non-critical.'
    );
    return new Set();
  }

  const expanded = await compileTemplate(html, templatesDir);
  return scanCandidates(expanded, registry);
}

export function splitCriticalCSS(
  collected: CollectedCSS,
  criticalCandidates: Set<string>,
  registry: CandidateRegistry
): { critical: Map<CSSLayer, string[]>; nonCritical: Map<CSSLayer, string[]> } {
  const critical = new Map<CSSLayer, string[]>();
  const nonCritical = new Map<CSSLayer, string[]>();

  for (const [layer, chunks] of collected.critical) {
    critical.set(layer, []);
    if (!nonCritical.has(layer)) nonCritical.set(layer, []);

    for (const chunk of chunks) {
      const candidateName = findCandidateForChunk(chunk, layer, registry);
      if (candidateName && criticalCandidates.has(candidateName)) {
        critical.get(layer)!.push(chunk);
      } else {
        nonCritical.get(layer)!.push(chunk);
      }
    }
  }

  for (const [layer, chunks] of collected.nonCritical) {
    if (!nonCritical.has(layer)) nonCritical.set(layer, []);
    nonCritical.get(layer)!.push(...chunks);
  }

  return { critical, nonCritical };
}

function findCandidateForChunk(
  chunk: string,
  layer: CSSLayer,
  registry: CandidateRegistry
): string | null {
  for (const [name, candidate] of registry.candidates) {
    if (candidate.layer === layer && candidate.criticalCSS === chunk) {
      return name;
    }
  }
  return null;
}
