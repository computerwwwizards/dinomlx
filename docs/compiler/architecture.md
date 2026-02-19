# Compiler Architecture

This document provides a high-level overview of the DINOMLX compiler architecture.

## Overview

The DINOMLX compiler is designed as a pipeline that transforms source templates into a structured Intermediate Representation (IR), and then into the final HTML/CSS output. The compiler is modular, separating the parsing, resolution, and generation phases.

## Core Components

The compiler consists of several key modules:

### 1. Parser
Responsible for reading the source files (`.html`, `.css`) and transforming them into Abstract Syntax Trees (ASTs).

- **HTML Parsing**: Uses `cheerio` (with `xmlMode: true`) to parse HTML templates and components.
- **Candidate Extraction**: Identifies CSS class names (candidates) used in templates.

### 2. Candidates Registry (In-Memory DB)
A critical component for the Static Site Generation (SSG) process. It acts as the single source of truth for all CSS styles.

- **Initialization**: On startup, it scans the `src/candidates` directory.
- **Storage**: Loads all CSS candidate definitions into an optimized **in-memory JSON map**.
- **Resolution**: Serves request from the compiler to resolve a candidate name (e.g., `button-primary`) to its actual CSS rules.
- **Performance**: Provides O(1) lookups for style generation, significantly speeding up the build process compared to repeated file I/O.

### 3. Dependency Graph
Manages the relationships between components, templates, and candidates.

- **Component Resolution**: Maps component tags (e.g., `<c-navbar>`) to their source files.
- **Transitive Dependencies**: Tracks which components use other components.

### 4. IR Generator
Transforms the parsed ASTs and dependency graph into the [Intermediate Representation (IR)](./intermediate-representation.md).

- **Slot Processing**: Handles content distribution into slots.
- **Hash Generation**: Assigns unique hashes to component instances based on content and props.

### 5. Critical CSS Engine
Analyzes the IR to determine the Critical CSS for each page.

- **Above-the-Fold Logic**: Identifies components visible in the initial viewport.
- **Candidate Tracing**: Queries the **Candidates Registry** to collect all CSS rules required by the critical path.
- **Budget Enforcement**: Ensures the inlined CSS stays within the performance budget (default 2KB).

### 6. Code Generator (Synthesizer)
Takes the optimized IR and generates the final output files.

- **HTML Stitching**: Replaces hashes with actual content.
- **Localization**: Injects localized strings.
- **Asset Linking**: Injects `<link>` tags for deferable CSS and scripts.

## Data Flow

```mermaid
graph TD
    Source[Source Files] --> Parser
    Parser --> AST[AST]
    Parser --> Registry[Candidates Registry (In-Memory)]
    AST --> Resolver[Dependency Resolver]
    Resolver --> IRGen[IR Generator]
    IRGen --> IR[Intermediate Representation]
    IR --> Analyzer[Critical CSS Analyzer]
    Analyzer --> Registry
    Analyzer --> CodeGen[Code Generator]
    CodeGen --> Output[Dist Folder]
```

## Key Design Principles

- **Zero-Runtime**: The compilation happens entirely at build time.
- **Atomic CSS**: The system is built around atomic CSS classes (candidates) to maximize reuse and minimize bundle size.
- **Localization First**: Localization is treated as a first-class citizen in the compilation pipeline.
- **Performance by Default**: Critical CSS extraction and deferral are automatic.
