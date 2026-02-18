import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { PageEntry } from '../core/types.ts';

export async function scanPages(pagesDir: string): Promise<PageEntry[]> {
  const entries: PageEntry[] = [];
  await walkDir(pagesDir, pagesDir, entries);
  entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return entries;
}

async function walkDir(baseDir: string, currentDir: string, entries: PageEntry[]): Promise<void> {
  const dirEntries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of dirEntries) {
    const fullPath = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(baseDir, fullPath, entries);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      entries.push({
        relativePath: relative(baseDir, fullPath),
        absolutePath: fullPath,
      });
    }
  }
}
