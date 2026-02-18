import { Readable } from 'node:stream';
import type { Renderer, RenderMode } from '../types';

export class SimpleRenderer implements Renderer {
  private src: string = '';
  private target: string = '';

  from(src: string): this {
    this.src = src;
    return this;
  }

  saveTo(target: string): this {
    this.target = target;
    return this;
  }

  render<T extends RenderMode = 'generator'>(
    mode: T
  ): T extends 'promise'
    ? Promise<string>
    : T extends 'readable'
      ? Readable
      : AsyncGenerator<string, string> {
    if (mode === 'promise') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Promise.resolve(this.src) as any;
    }
    if (mode === 'readable') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Readable.from([this.src]) as any;
    }
    // Generator
    async function* gen(src: string) {
      yield src;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return gen(this.src) as any;
  }
}
