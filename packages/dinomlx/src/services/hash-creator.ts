import { createHash } from 'node:crypto';
import type { CreateHashOptions, HASHCreator } from '../types';

export class NodeCryptoHashCreator implements HASHCreator {
  async createHash(options: CreateHashOptions): Promise<string> {
    const hash = createHash('sha256');
    hash.update(options.componentName);

    // Sort keys to ensure deterministic hash
    if (options.customAttributes) {
      const sortedKeys = Object.keys(options.customAttributes).sort();
      for (const key of sortedKeys) {
        hash.update(key);
        hash.update(options.customAttributes[key]);
      }
    }

    if (options.spreadAttributes) {
      const sortedKeys = Object.keys(options.spreadAttributes).sort();
      for (const key of sortedKeys) {
        hash.update(key);
        hash.update(options.spreadAttributes[key]);
      }
    }

    if (options.slot) {
      hash.update(options.slot);
    }

    return hash.digest('hex');
  }
}
