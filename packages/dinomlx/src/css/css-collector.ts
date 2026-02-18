import { CSS_LAYERS, type CSSLayer, type CandidateRegistry, type CollectedCSS } from '../core/types.ts';

export function collectCSS(usedCandidates: Set<string>, registry: CandidateRegistry): CollectedCSS {
  const critical = new Map<CSSLayer, string[]>();
  const nonCritical = new Map<CSSLayer, string[]>();

  for (const layer of CSS_LAYERS) {
    critical.set(layer, []);
    nonCritical.set(layer, []);
  }

  for (const candidateName of usedCandidates) {
    const candidate = registry.candidates.get(candidateName);
    if (!candidate) continue;

    if (candidate.criticalCSS) {
      critical.get(candidate.layer)!.push(candidate.criticalCSS);
    }
    if (candidate.nonCriticalCSS) {
      nonCritical.get(candidate.layer)!.push(candidate.nonCriticalCSS);
    }
  }

  return { critical, nonCritical };
}
