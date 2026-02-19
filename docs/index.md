# DINOMLX Documentation

Welcome to the DINOMLX documentation. This project explores an edge-first Static Site Generator (SSG) with a focus on CSS efficiency, distributed components, and a custom compilation pipeline.

## Table of Contents

### User Guide
*   [Project Structure](./guide/project-structure.md): Understanding the file organization (`pages`, `templates`, `candidates`).
*   [Templating Language](./templating/language.md): Detailed syntax guide for DINOMLX templates.

### Design System
*   [Overview](./design-system/index.md): Core principles of the CSS architecture.
*   [Layers](./design-system/layers.md): Managing specificity with CSS Layers.
*   [Candidates](./design-system/candidates/index.md): The concept of CSS candidates.
*   [CSS Primitives](./design-system/css-primitives/index.md): Standard layout components.

### Architecture & Concepts
*   [Server vs Client](./architecture/server-clients.md): Understanding the boundaries.
*   [Distributed CSS Management](./architecture/distributed-css-management.md): Protocol for micro-frontend CSS orchestration.

### Compiler Internals
*   [Architecture](./compiler/architecture.md): Overview of the compilation pipeline.
*   [Intermediate Representation (IR)](./compiler/intermediate-representation.md): Detailed specification of the JSON output format.
*   [Build Process](./compiler/build-process.md): From source files to final HTML and CSS.
