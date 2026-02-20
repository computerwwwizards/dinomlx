#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { createCli } from './cli';

// Execute CLI if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createCli().parse(process.argv);
}

export * from './types';
export * from './container';
