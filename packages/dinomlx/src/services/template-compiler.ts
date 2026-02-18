import { writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import type { HTMLTemplateCompiler, HASHCreator } from '../types';

export class CheerioTemplateCompiler implements HTMLTemplateCompiler {
  private $!: cheerio.CheerioAPI;
  private src: string = '';
  private targetPath?: string;
  private transformed: string = '';
  private onFinishCallback?: (transformed: string) => void;

  constructor(
    private hashCreator: HASHCreator,
    private cacheDir: string
  ) {}

  from(src: string): this {
    this.src = src;
    this.$ = cheerio.load(src, { xmlMode: true });
    return this;
  }

  forceStartTransfrom(): this {
    if (!this.$) {
      this.$ = cheerio.load(this.src, { xmlMode: true });
    }
    return this;
  }

  saveTo(target: string): this {
    this.targetPath = target;
    return this;
  }

  async compile(): Promise<void> {
    if (!this.$) {
      throw new Error('No source provided via .from()');
    }

    // Generate hash
    const normalized = this.$.html();
    const hash = await this.hashCreator.createHash({
      componentName: 'template',
      slot: normalized
    });

    // Check cache
    const metaPath = join(this.cacheDir, `${hash}.json`);
    let cacheHit = false;
    try {
        await access(metaPath);
        cacheHit = true;
        console.log(`Cache hit for ${hash}`);
    } catch {
        cacheHit = false;
    }

    if (!cacheHit) {
        // Extract candidates (class names)
        const candidates = new Set<string>();
        this.$('[class]').each((_, el) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const classes = (this.$(el) as any).attr('class')?.split(/\s+/) || [];
          for (const cls of classes) {
            if (cls) candidates.add(cls);
          }
        });

        // Save metadata (Fire and Forget style, but logged)
        this.saveMetadata(hash, Array.from(candidates), normalized).catch((err) => {
          console.error(`Failed to save metadata for hash ${hash}:`, err);
        });
    }

    // Transformation logic (currently identity)
    this.transformed = normalized;

    if (this.targetPath) {
      await writeFile(this.targetPath, this.transformed, 'utf-8');
    }

    if (this.onFinishCallback) {
      this.onFinishCallback(this.transformed);
    }
  }

  private async saveMetadata(hash: string, candidates: string[], html: string) {
    await mkdir(this.cacheDir, { recursive: true });
    const metaPath = join(this.cacheDir, `${hash}.json`);
    const metadata = {
      hash,
      candidates,
      html, // Saving the HTML content itself as per "html data already to directly inject"
      timestamp: Date.now()
    };
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  onFinishTransfrom(cb: (transformed: string) => void): this {
    this.onFinishCallback = cb;
    return this;
  }

  async getTransformed(): Promise<string> {
    if (!this.transformed) {
      await this.compile(); // Ensure compiled if requested
    }
    return this.transformed;
  }
}
