import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { buildCandidateRegistry } from './candidate-registry.ts';

describe('buildCandidateRegistry', () => {
  let candidatesDir: string;

  beforeEach(async () => {
    candidatesDir = await mkdtemp(join(tmpdir(), 'dinomlx-candidates-'));
    for (const layer of ['global', 'layout', 'components', 'utils']) {
      await mkdir(join(candidatesDir, layer), { recursive: true });
    }
  });

  afterEach(async () => {
    await rm(candidatesDir, { recursive: true, force: true });
  });

  test('returns empty registry for empty directories', async () => {
    const registry = await buildCandidateRegistry(candidatesDir);
    expect(registry.candidates.size).toBe(0);
  });

  test('finds candidate with critical and non-critical CSS', async () => {
    const candidateDir = join(candidatesDir, 'utils', 'text-red');
    await mkdir(candidateDir, { recursive: true });
    await writeFile(join(candidateDir, 'critical.css'), '.text-red { color: red; }');
    await writeFile(join(candidateDir, 'non-critical.css'), '.text-red:hover { color: darkred; }');

    const registry = await buildCandidateRegistry(candidatesDir);
    expect(registry.candidates.size).toBe(1);
    const candidate = registry.candidates.get('text-red')!;
    expect(candidate.layer).toBe('utils');
    expect(candidate.criticalCSS).toBe('.text-red { color: red; }');
    expect(candidate.nonCriticalCSS).toBe('.text-red:hover { color: darkred; }');
  });

  test('finds candidate with only critical CSS', async () => {
    const candidateDir = join(candidatesDir, 'components', 'btn-primary');
    await mkdir(candidateDir, { recursive: true });
    await writeFile(join(candidateDir, 'critical.css'), '.btn-primary { background: blue; }');

    const registry = await buildCandidateRegistry(candidatesDir);
    const candidate = registry.candidates.get('btn-primary')!;
    expect(candidate.criticalCSS).toBe('.btn-primary { background: blue; }');
    expect(candidate.nonCriticalCSS).toBeNull();
  });

  test('assigns correct layer to candidates', async () => {
    await mkdir(join(candidatesDir, 'global', 'reset'), { recursive: true });
    await writeFile(join(candidatesDir, 'global', 'reset', 'critical.css'), '* { margin: 0; }');

    await mkdir(join(candidatesDir, 'components', 'card'), { recursive: true });
    await writeFile(join(candidatesDir, 'components', 'card', 'critical.css'), '.card { padding: 1rem; }');

    const registry = await buildCandidateRegistry(candidatesDir);
    expect(registry.candidates.get('reset')!.layer).toBe('global');
    expect(registry.candidates.get('card')!.layer).toBe('components');
  });

  test('handles missing layer directories gracefully', async () => {
    await rm(join(candidatesDir, 'layout'), { recursive: true, force: true });
    const registry = await buildCandidateRegistry(candidatesDir);
    expect(registry.candidates.size).toBe(0);
  });
});
