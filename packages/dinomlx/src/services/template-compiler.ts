import { writeFile } from 'node:fs/promises';
import * as cheerio from 'cheerio';
import type { HTMLTemplateCompiler } from '../types';

export class CheerioTemplateCompiler implements HTMLTemplateCompiler {
  private $!: cheerio.CheerioAPI;
  private src: string = '';
  private targetPath?: string;
  private transformed: string = '';
  private onFinishCallback?: (transformed: string) => void;

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

    // TODO: Component transformation logic would go here.
    // Currently implementing basic identity transformation.
    this.transformed = this.$.html();

    if (this.targetPath) {
      await writeFile(this.targetPath, this.transformed, 'utf-8');
    }

    if (this.onFinishCallback) {
      this.onFinishCallback(this.transformed);
    }
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
