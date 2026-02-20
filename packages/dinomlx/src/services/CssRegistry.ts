import { glob } from 'glob';
import postcss from 'postcss';
import { readFile } from 'node:fs/promises';
import {
  CSSRegister,
  CSSRegisterOptions,
  CSSGenerator,
  CSSMode,
} from '../types';

export class CssRegistry implements CSSRegister, CSSGenerator {
  private candidates = new Map<string, string>(); // name -> css string
  private globalCss = '';

  async loadFromDir(dir: string) {
    const files = await glob(`${dir}/**/*.css`);
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      const root = postcss.parse(content);

      root.walkRules((rule) => {
        const selector = rule.selector;
        const ruleStr = rule.toString();

        // Split selectors by comma to handle groups like .foo, .bar
        const selectors = selector.split(',').map((s) => s.trim());

        selectors.forEach((sel) => {
          // Regex for simple class selector: ^\.([a-zA-Z0-9_-]+)$
          const match = sel.match(/^\.([a-zA-Z0-9_-]+)$/);
          if (match) {
            const className = match[1];
            this.register(className, { raw: { critical: ruleStr } });
          } else {
            // Complex selector, add to global for now
            this.globalCss += ruleStr + '\n';
          }
        });
      });
    }
  }

  register(candidateName: string, options: CSSRegisterOptions): this {
    if (options.raw?.critical) {
      const existing = this.candidates.get(candidateName) || '';
      // Avoid duplicate rule strings for the same candidate
      if (!existing.includes(options.raw.critical)) {
        this.candidates.set(
          candidateName,
          existing + options.raw.critical + '\n',
        );
      }
    }
    return this;
  }

  async save(): Promise<void> {
    // No-op
  }

  get(candidateName: string): CSSRegisterOptions | undefined {
    const css = this.candidates.get(candidateName);
    if (!css) return undefined;
    return { raw: { critical: css } };
  }

  async getPromiseByCandidates<T extends CSSMode = 'both'>(
    set: Set<string>,
    mode: T = 'both' as T,
  ) {
    // Use a Set to deduplicate identical rule strings
    const uniqueRules = new Set<string>();

    // Always include global CSS
    // Split global CSS by newlines to potentially deduplicate if needed,
    // but global is a big blob usually.
    // For now, just add it as one chunk if not empty.
    if (this.globalCss.trim()) {
      uniqueRules.add(this.globalCss);
    }

    const sortedCandidates = Array.from(set).sort();

    for (const candidate of Array.from(sortedCandidates)) {
      const css = this.candidates.get(candidate);
      if (css) {
        // css might contain multiple rules joined by \n
        // Split and add individually?
        // Or just add the block.
        // If rules are identical strings, Set handles it.
        uniqueRules.add(css);
      }
    }

    const critical = Array.from(uniqueRules).join('\n');
    const deferable = ''; // TODO: Implement deferable logic if needed

    if (mode === 'critical') return { critical } as any;
    if (mode === 'deferable') return { deferable } as any;
    return { critical, deferable } as any;
  }
}
