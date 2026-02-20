
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CSSRegisterLayerImpl } from '../src/css-register';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const dinomlxDir = join(process.cwd(), '.dinomlx');
const dbFile = join(dinomlxDir, 'css-register.json');
const lockDir = join(dinomlxDir, 'css-register.lock');

describe('CSSRegisterLayerImpl', () => {
  beforeEach(async () => {
    // Clean up before each test
    await fs.rm(dinomlxDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await fs.rm(dinomlxDir, { recursive: true, force: true });
  });

  it('should register candidates and save them to JSON', async () => {
    const register = new CSSRegisterLayerImpl();

    register.utils.register('text-red-500', { raw: { critical: 'color: red;' } });
    register.components.register('btn-primary', { raw: { deferable: 'background: blue;' } });

    await register.save();

    const fileContent = await fs.readFile(dbFile, 'utf-8');
    const data = JSON.parse(fileContent);

    expect(data.utils['text-red-500']).toEqual({ raw: { critical: 'color: red;' } });
    expect(data.components['btn-primary']).toEqual({ raw: { deferable: 'background: blue;' } });
  });

  it('should handle nested layers correctly', async () => {
    const register = new CSSRegisterLayerImpl();

    register.layout.register('container', { raw: { critical: 'max-width: 1200px;' } });
    register.global.register('body', { raw: { critical: 'margin: 0;' } });

    await register.save();

    const fileContent = await fs.readFile(dbFile, 'utf-8');
    const data = JSON.parse(fileContent);

    expect(data.layout['container']).toBeDefined();
    expect(data.global['body']).toBeDefined();
    expect(data.utils).toBeUndefined(); // Should not exist if empty (or empty object if merged differently, but our logic only merges non-empty)
    // Actually our logic performs a merge for each layer if it has candidates.
    // If a layer has no candidates, it's not merged into `currentData` unless it already existed.
  });

  it('should merge with existing data', async () => {
    // Setup initial data
    await fs.mkdir(dinomlxDir, { recursive: true });
    await fs.writeFile(dbFile, JSON.stringify({
      utils: {
        'existing-class': { raw: { critical: 'display: block;' } }
      }
    }));

    const register = new CSSRegisterLayerImpl();
    register.utils.register('new-class', { raw: { critical: 'display: flex;' } });

    await register.save();

    const fileContent = await fs.readFile(dbFile, 'utf-8');
    const data = JSON.parse(fileContent);

    expect(data.utils['existing-class']).toBeDefined();
    expect(data.utils['new-class']).toBeDefined();
  });

  it('should handle concurrency with locking', async () => {
    const register1 = new CSSRegisterLayerImpl();
    const register2 = new CSSRegisterLayerImpl();

    register1.utils.register('class-1', { raw: { critical: '1' } });
    register2.utils.register('class-2', { raw: { critical: '2' } });

    // Save both simultaneously
    await Promise.all([register1.save(), register2.save()]);

    const fileContent = await fs.readFile(dbFile, 'utf-8');
    const data = JSON.parse(fileContent);

    expect(data.utils['class-1']).toBeDefined();
    expect(data.utils['class-2']).toBeDefined();
  });

  it('should recover from stale locks', async () => {
    await fs.mkdir(dinomlxDir, { recursive: true });
    await fs.mkdir(lockDir);

    // Manually set mtime to be old
    const oldTime = new Date(Date.now() - 10000); // 10 seconds ago
    await fs.utimes(lockDir, oldTime, oldTime);

    const register = new CSSRegisterLayerImpl();
    register.utils.register('class-stale', { raw: { critical: '1' } });

    // This should succeed by removing the stale lock
    await register.save();

    const fileContent = await fs.readFile(dbFile, 'utf-8');
    const data = JSON.parse(fileContent);
    expect(data.utils['class-stale']).toBeDefined();

    // Lock should be gone
    expect(existsSync(lockDir)).toBe(false);
  });

  it('should clear candidates after save', async () => {
    const register = new CSSRegisterLayerImpl();
    register.utils.register('class-1', { raw: { critical: '1' } });

    await register.save();

    // Register nothing new
    // Hack: we can't easily spy on performSave private method, but we can check if file mtime changes
    // or just rely on the fact that if we call save again with logging it wouldn't log.
    // Better: check internal state if we exposed it, or check that subsequent save doesn't overwrite with empty if we were doing that.

    // Let's verify that the internal map is empty.
    expect(register.utils.candidates.size).toBe(0);
  });

  it('should not save if no candidates', async () => {
     const register = new CSSRegisterLayerImpl();
     // No registration

     // Mock fs.writeFile to ensure it's not called
     const writeFileSpy = vi.spyOn(fs, 'writeFile');

     await register.save();

     expect(writeFileSpy).not.toHaveBeenCalled();
     writeFileSpy.mockRestore();
  });
});
