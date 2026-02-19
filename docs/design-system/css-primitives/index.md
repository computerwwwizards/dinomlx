# CSS Primitives

DINOMLX encourages using a set of layout primitives to handle structure and spacing, separating layout concerns from component styling.

## Core Primitives

*   [Columns](./columns.md): A container for column-based layouts.
*   [Bleeding Columns](./bleeding-columns.md): Columns that can extend to the full width of the viewport.
*   [Column Item](./column-item.md): Individual items within a column layout.

## Planned Primitives

The following primitives are part of the design specification and will be available in future releases:

- 🚧 [Stack](#stack)
- 🚧 [Box](#box)
- 🚧 [Grid](#grid)

### Stack
A vertical or horizontal stack of elements with consistent spacing.
- **Use case**: Lists, form groups, card content.
- **Properties**: `gap`, `orientation`, `alignment`.

### Box
A generic container for content, handling padding, margin, and borders.
- **Use case**: Cards, panels, sections.

### Grid
A powerful 2D layout system based on CSS Grid.
- **Use case**: Complex page layouts, dashboards.
