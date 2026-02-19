# DINOMLX SSG CLI

Build CLI for Static Site Generation with DINOMLX

## Overview

The DINOMLX CLI is the main tool for building your static site. It handles:
- **Parsing**: Reads your HTML templates and CSS candidates.
- **Compilation**: Generates an Intermediate Representation (IR).
- **Optimization**: Extracts Critical CSS and defers the rest.
- **Output**: Produces optimized static assets ready for deployment.

**Note**: This is an experimental release. Expect rapid changes.

## Build Command

```bash
dinomlx build
```

| Option        | Default              | Description                                      |
| :------------ | :------------------- | :----------------------------------------------- |
| `--out-dir`   | `$pwd/dist`          | Output directory for generated assets            |
| `--cache-dir` | `$pwd/.dinomlx/cache/` | Directory for cache compilation data             |
| `--base-path` |                      | URL prefix for assets (e.g., `/my-blog`)         |
| `--src-root`  | `$pwd/src/`          | Path to source files                             |
| `--minify`    | `true`               | Whether to minify the output code                |

## Implementation Details

### XML Parsers
We currently use `cheerio` (XML mode) to parse custom components and query the DOM during compilation.

### Hashing (SHA)
Node.js native crypto is used to generate SHA-256 hashes for components, enabling efficient caching and cache invalidation.

### Architecture Patterns
The system lacks clear boundaries and APIs in some areas. Treat this as a Proof of Concept (PoC).

See [Compiler Architecture](../../docs/compiler/architecture.md) for a deeper dive.
