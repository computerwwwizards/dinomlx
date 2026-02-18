import { parseHTML } from '../templating/parser.ts';
import type { CandidateRegistry } from '../core/types.ts';

export function scanCandidates(html: string, registry: CandidateRegistry): Set<string> {
  const root = parseHTML(html);
  const usedCandidates = new Set<string>();

  const elements = root.querySelectorAll('[class]');
  for (const element of elements) {
    const classAttr = element.getAttribute('class');
    if (!classAttr) continue;

    const classNames = classAttr.split(/\s+/).filter(Boolean);
    for (const className of classNames) {
      if (registry.candidates.has(className)) {
        usedCandidates.add(className);
      }
    }
  }

  return usedCandidates;
}
