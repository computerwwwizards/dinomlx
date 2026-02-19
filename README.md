# DINOMLX

> **An Edge-First Server-Side Rendering Engine**

DINOMLX is an experimental Static Site Generator (SSG) designed for maximum performance, minimal bundle sizes, and seamless edge deployment. It introduces a novel approach to CSS management, component composition, and compilation.

## Key Features

*   **Zero-Runtime Overhead**: Templates are compiled to static HTML and minimal CSS at build time.
*   **Candidate-Based CSS**: A unique approach to styling that eliminates duplication and enforces strict performance budgets.
*   **Critical CSS by Default**: Automatically extracts and inlines critical CSS for above-the-fold content, deferring the rest.
*   **Distributed Architecture**: Designed for micro-frontends and distributed teams, with a protocol for sharing styles without conflicts.
*   **Localization First**: Built-in i18n support at the compiler level.

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/index.md) directory.

*   [**User Guide**](./docs/guide/project-structure.md): Get started with the project structure.
*   [**Templating Language**](./docs/templating/language.md): Learn the syntax.
*   [**Design System**](./docs/design-system/index.md): Understand the CSS philosophy.
*   [**Compiler Internals**](./docs/compiler/architecture.md): Deep dive into how it works.

## Getting Started

(Coming soon: Installation instructions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) (coming soon).

## License

MIT
