import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { CSSRegister, CSSRegisterOptions, CSSGenerator, CSSMode } from '../types';

export class FileSystemCSSRegister implements CSSRegister {
  public registry = new Map<string, CSSRegisterOptions>();
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  register(candidateName: string, options: CSSRegisterOptions): this {
    this.registry.set(candidateName, options);
    return this;
  }

  async save(): Promise<void> {
    const registryPath = join(this.cacheDir, 'css-registry.json');
    await mkdir(this.cacheDir, { recursive: true });

    // Serialize the registry map to an object for JSON storage
    const data: Record<string, CSSRegisterOptions> = {};
    for (const [key, value] of this.registry.entries()) {
      data[key] = value;
    }

    await writeFile(registryPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async load(): Promise<void> {
      try {
          const registryPath = join(this.cacheDir, 'css-registry.json');
          const content = await readFile(registryPath, 'utf-8');
          const data = JSON.parse(content);
          for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                this.registry.set(key, data[key]);
              }
          }
      } catch (e) {
          // Ignore if file doesn't exist or is invalid
      }
  }
}

export class SimpleCSSGenerator implements CSSGenerator {
  constructor(private register: FileSystemCSSRegister) {}

  async getPromiseByCandidates<T extends CSSMode = 'both'>(
    set: Set<string>,
    mode?: T
  ): Promise<
    T extends 'critical'
      ? { critical: string }
      : T extends 'both'
        ? { critical: string; deferable: string }
        : { deferable: string }
  > {
    let critical = '';
    let deferable = '';

    for (const candidate of set) {
      const options = this.register.registry.get(candidate);
      if (options) {
        if (options.raw?.critical) critical += options.raw.critical;
        if (options.raw?.deferable) deferable += options.raw.deferable;
      }
    }

    if (mode === 'critical') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { critical } as any;
    } else if (mode === 'deferable') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { deferable } as any;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { critical, deferable } as any;
    }
  }
}
