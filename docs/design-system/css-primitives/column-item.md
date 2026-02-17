# Column Item

## Problem

Column containers define structure, but individual items need a way to participate in that structure declaratively. In many grid systems this is handled via a large set of utility classes (e.g. `col-span-4`, `col-start-2`) or via inline styles. Both approaches either explode the CSS surface area or tightly couple layout decisions to markup.

The missing piece is a minimal, composable contract that allows an item to express intent (how many tracks it wants to occupy, and optionally where it begins) while leaving the actual grid definition to the container.

## Blueprint

- MUST allow configuring how many columns / tracks the item spans.

- MUST optionally allow configuring the track at which the item starts.

- MUST default to a safe, predictable placement when no configuration is provided.

- MUST remain agnostic of the container’s concrete column count, relying only on shared conventions.

## Implementation suggestions

A column item exposes its layout intent through CSS custom properties. The container defines the grid; the item merely consumes that contract.

```css
.column-item {
  grid-column-end: span var(--c-i-span, 1);
  grid-column-start: var(--c-i-start, unset);
}
```

By keeping `grid-column-start` optional and defaulting to auto, items naturally flow in document order unless explicitly positioned. Because both values are driven by custom properties, they can be set inline, via attributes, or through higher-level abstractions without introducing new CSS rules.

<!-- TODO: explore named grid columns so that grid-column-start and span can be declared using names instead of numbers — would make the grid more declarative and easier to reason about in templates -->

