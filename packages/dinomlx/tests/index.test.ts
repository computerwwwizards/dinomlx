import { expect, test } from 'vitest';
import { NodeCryptoHashCreator } from '../src/services/hash-creator';

test('NodeCryptoHashCreator creates consistent hash', async () => {
  const creator = new NodeCryptoHashCreator();
  const hash1 = await creator.createHash({ componentName: 'test' });
  const hash2 = await creator.createHash({ componentName: 'test' });
  expect(hash1).toBe(hash2);
});
