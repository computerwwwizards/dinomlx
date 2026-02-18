import type { CSSRegister, CSSRegisterOptions, CSSGenerator, CSSMode } from '../types';

export class InMemoryCSSRegister implements CSSRegister {
  public registry = new Map<string, CSSRegisterOptions>();

  register(candidateName: string, options: CSSRegisterOptions): this {
    this.registry.set(candidateName, options);
    return this;
  }

  async save(): Promise<void> {
    // No-op for in-memory implementation
  }
}

export class SimpleCSSGenerator implements CSSGenerator {
  constructor(private register: InMemoryCSSRegister) {}

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
