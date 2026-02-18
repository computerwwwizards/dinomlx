import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CSS_LAYERS, type CSSLayer, type CandidateDefinition, type CandidateRegistry } from '../core/types.ts';

export async function buildCandidateRegistry(candidatesDir: string): Promise<CandidateRegistry> {
  const candidates = new Map<string, CandidateDefinition>();

  for (const layer of CSS_LAYERS) {
    const layerDir = join(candidatesDir, layer);
    const layerCandidates = await scanLayerDir(layerDir, layer).catch(() => []);
    for (const candidate of layerCandidates) {
      candidates.set(candidate.name, candidate);
    }
  }

  return { candidates };
}

async function scanLayerDir(layerDir: string, layer: CSSLayer): Promise<CandidateDefinition[]> {
  const entries = await readdir(layerDir, { withFileTypes: true });
  const candidates: CandidateDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const candidateDir = join(layerDir, entry.name);
    const criticalCSS = await readFileSafe(join(candidateDir, 'critical.css'));
    const nonCriticalCSS = await readFileSafe(join(candidateDir, 'non-critical.css'));

    if (criticalCSS !== null || nonCriticalCSS !== null) {
      candidates.push({
        name: entry.name,
        layer,
        criticalCSS,
        nonCriticalCSS,
      });
    }
  }

  return candidates;
}

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}
